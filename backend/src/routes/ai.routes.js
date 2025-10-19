import { Router } from "express";
import "../lib/env.js"; // ensure .env is loaded before using OpenAI
import OpenAI from "openai";
import Project from "../models/Project.js";
import NGOManagerProfile from "../models/NGOManagerProfile.js";
import AISummary from "../models/AISummary.js";
import { authenticate } from "../middleware/auth.js"; // you already have JWT guard?

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const TTL_MIN = Number(process.env.AI_CACHE_TTL_MIN || 720); // default 12h

// 🧠 minimal-cost prompt builder (send only what’s needed)
function buildPayloadForProject(p) {
  return {
    name: p.name,
    sdg: p.sdg,
    status: p.status,
    region: p.region,
    // cap description length to cut tokens
    description: (p.description || "").slice(0, 400),
    dates: { start: p.start_date, end: p.end_date },
    budget: p.budget,
    beneficiaries: {
      target: p.target_beneficiaries || 0,
      achieved: p.achieved_beneficiaries || 0,
    },
    partners: Array.isArray(p.partners)
      ? p.partners.slice(0, 6).map((x) => ({ name: x.name, type: x.type }))
      : [],
    // trim expenses (name + numbers only)
    expenses: (p.expenses || []).map(e => ({
      name: e.name, allocated: e.allocated || 0, actual: e.actual || 0
    })).slice(0, 12),  // safety cap
  };
}

function systemPrompt() {
  return `
You are a precise NGO finance/impact analyst. Produce a crisp summary (<=160 words).
Audience: donors/volunteers. Use plain language, short bullets, concrete numbers and %.
Omit unknowns or clearly say "No data yet". No marketing fluff.
`.trim();
}

function userPrompt(payload) {
  return `
Summarize this data. Return sections:
- Overview (1–2 sentences)
- Finance (budget, allocation, under/overspend)
- Impact (target vs achieved)
- Notes (1–2 risks or next steps if relevant)
DATA:
${JSON.stringify(payload)}
`.trim();
}

// GET cached (fresh) if available
async function getCached(key) {
  const row = await AISummary.findOne({ key }).lean();
  if (!row) return null;
  const ageMin = (Date.now() - new Date(row.updatedAt).getTime()) / 60000;
  return ageMin <= TTL_MIN ? row : null;
}

// Get any cache regardless of age (stale allowed)
async function getAnyCache(key) {
  const row = await AISummary.findOne({ key }).lean();
  return row || null;
}

router.post("/summary", authenticate, async (req, res) => {
  try {
    const { scope = "project", id, forceRefresh = false } = req.body;
    const userId = req.user.id;

    let key = "";
    let payload = null;

    if (scope === "project") {
      if (!id) return res.status(400).json({ message: "project id required" });
      const p = await Project.findById(id)
        .populate("organization", "organization_name")
        .lean();
      if (!p) return res.status(404).json({ message: "Project not found" });

      // (Optional) access rules: donors/volunteers can view public; managers can view owned.
      key = `project:${p._id}`;
      payload = buildPayloadForProject(p);

    } else if (scope === "org") {
      const profile = await NGOManagerProfile.findOne({ user_id: userId }).lean();
      if (!profile) return res.status(404).json({ message: "Organization not found" });
      const projects = await Project.find({ organization: profile._id }).lean();

      key = `org:${profile._id}`;
      payload = {
        organization: profile.organization_name,
        // aggregate a few key totals on server to reduce tokens
        totals: {
          projects: projects.length,
          budget: projects.reduce((s,p)=>s+(p?.budget?.amount||0),0),
          allocated: projects.reduce((s,p)=> s + (p?.expenses||[]).reduce((a,e)=>a+(e.allocated||0),0), 0),
          actual: projects.reduce((s,p)=> s + (p?.expenses||[]).reduce((a,e)=>a+(e.actual||0),0), 0),
          targetBen: projects.reduce((s,p)=>s+(p?.target_beneficiaries||0),0),
          achievedBen: projects.reduce((s,p)=>s+(p?.achieved_beneficiaries||0),0),
        },
        // short list of projects (only essentials)
        projects: projects.slice(0, 8).map(buildPayloadForProject),
      };
    } else {
      return res.status(400).json({ message: "invalid scope" });
    }

    if (!forceRefresh) {
      const cached = await getCached(key);
      if (cached) return res.json({ summary: cached.text, cached: true, source: "cache" });
    }

    // Call model (Responses API). Keep input simple to avoid SDK shape mismatches.
    let text = "";
    let source = "responses";
    let quotaExceeded = false;
    try {
      const response = await openai.responses.create({
        model: MODEL,
        temperature: 0.2,
        max_output_tokens: 320,
        input: `${systemPrompt()}\n\n${userPrompt(payload)}`,
      });

      text =
        response.output_text?.trim() ||
        response.output?.[0]?.content?.[0]?.text?.trim() ||
        "";
    } catch (e1) {
      console.error("Responses API failed:", e1?.message || e1);
      quotaExceeded = String(e1?.message || "").includes("429") || quotaExceeded;
      // Fallback to chat.completions for wider compatibility
      try {
        const chat = await openai.chat.completions.create({
          model: MODEL,
          temperature: 0.2,
          max_tokens: 320,
          messages: [
            { role: "system", content: systemPrompt() },
            { role: "user", content: userPrompt(payload) },
          ],
        });
        text = (chat.choices?.[0]?.message?.content || "").trim();
        source = "chat";
      } catch (e2) {
        console.error("Chat Completions fallback failed:", e2?.message || e2);
        quotaExceeded = quotaExceeded || String(e2?.message || "").includes("429");
      }
    }

    if (!text) {
      // If we hit quota limits and we have any stale cache, serve it
      if (quotaExceeded) {
        const stale = await getAnyCache(key);
        if (stale?.text) {
          return res.json({ summary: stale.text, cached: true, source: "cache-stale", quotaExceeded: true });
        }
      }

      // Last-resort local summary so the user still sees something helpful (no AI call). Do NOT overwrite cache.
      const b = payload?.budget?.amount || 0;
      const ex = (payload?.expenses || []);
      const allocated = ex.reduce((s, x) => s + (x.allocated || 0), 0);
      const actual = ex.reduce((s, x) => s + (x.actual || 0), 0);
      const tgt = payload?.beneficiaries?.target || 0;
      const ach = payload?.beneficiaries?.achieved || 0;
      const pct = tgt > 0 ? Math.round((ach / tgt) * 100) : 0;
      text = [
        `Overview: ${payload?.name || "Project"} (SDG ${payload?.sdg || "-"}) in ${payload?.region || "N/A"}.`,
        `Finance: Budget $${b.toLocaleString()} • Allocated $${allocated.toLocaleString()} • Actual $${actual.toLocaleString()}.`,
        `Impact: ${ach.toLocaleString()} of ${tgt.toLocaleString()} beneficiaries (${pct}%).`,
        `Notes: Status ${payload?.status || "N/A"}; check detailed reports for breakdowns.`,
      ].join("\n");
      source = "local";
    }

    // Only upsert if we actually got AI content (avoid overwriting AI cache with local fallback)
    if (source === "responses" || source === "chat") {
      await AISummary.findOneAndUpdate(
        { key },
        { key, text, updatedAt: new Date(), meta: { model: MODEL, source } },
        { upsert: true }
      );
    }

    res.json({ summary: text, cached: false, source, quotaExceeded });
  } catch (err) {
    console.error(err);
    // graceful fallback to keep UX smooth
    return res.json({
      summary:
        "Overview: Data available but AI service is currently unavailable.\n• Finance: Please review budget and actuals in the dashboard.\n• Impact: Check beneficiary progress.\n• Notes: Try again later or refresh.",
      cached: false,
      fallback: true,
    });
  }
});

export default router;
