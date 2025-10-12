import Project, { PROJECT_STATUSES } from "../models/Project.js";
import NGOManagerProfile from "../models/NGOManagerProfile.js";

const STATUS_MAP = {
  "On-going": "ON_GOING",
  "Planned": "PLANNED",
  "Completed": "COMPLETED",
};

// List all projects (public)
export async function listAllProjects(req, res) {
  try {
    const docs = await Project.find({}).sort({ createdAt: -1 });
    return res.json({ projects: docs });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to list all projects" });
  }
}
//test start here
const normalizeStatus = (s) =>
  PROJECT_STATUSES.includes(s) ? s : STATUS_MAP[s] || "ON_GOING";
//test ends here

// function parseDate(v) {
//   if (!v) return undefined;
//   const d = new Date(v);
//   return Number.isNaN(d.getTime()) ? undefined : d;
// }

//test sart here
const parseDate = (v) => (!v ? undefined : new Date(v));
//test ends here

/** POST /api/projects  (NGO_MANAGER only) */
export async function createProject(req, res) {
  try {
    const user = req.user;
    if (user.role !== "NGO_MANAGER") {
      return res.status(403).json({ message: "Only NGO Managers can create projects" });
    }

    const {
      name,
      status,             // "On-going" | "Planned" | "Completed"  (or enum)
      sdg,                // number 1..17
      start_date,
      end_date,
      budget_amount,      // number
      budget_currency = "USD",
      partners = [],        // array of { name, type }
      region = "",
      description = "",
      target_beneficiaries,
      achieved_beneficiaries,
    } = req.body;

    if (!name?.trim()) return res.status(400).json({ message: "name is required" });
    if (!sdg || sdg < 1 || sdg > 17) return res.status(400).json({ message: "sdg must be 1..17" });

    const statusEnum = PROJECT_STATUSES.includes(status)
      ? status
      : STATUS_MAP[status] || "ON_GOING";

    // find org profile to link (optional)
    const org = await NGOManagerProfile.findOne({ user_id: user._id }).select("_id");

    // Validate partners: must be array of objects with name and type
    let partnerObjs = [];
    if (Array.isArray(partners)) {
      partnerObjs = partners
        .filter(d => d && typeof d === "object" && d.name && d.type)
        .map(d => ({ name: String(d.name).trim(), type: String(d.type).trim() }));
    }

    const doc = await Project.create({
      owner: user._id,
      organization: org?._id,
      name: name.trim(),
      status: statusEnum,
      sdg: Number(sdg),
      start_date: parseDate(start_date),
      end_date: parseDate(end_date),
      budget: { amount: Number(budget_amount || 0), currency: String(budget_currency).toUpperCase() },
      partners: partnerObjs,
      region: region?.trim(),
      description: description?.trim(),
      target_beneficiaries: target_beneficiaries != null ? Number(target_beneficiaries) : undefined,
      achieved_beneficiaries: achieved_beneficiaries != null ? Number(achieved_beneficiaries) : undefined,
    });

    return res.status(201).json({ project: doc });
  } catch (err) {
    console.error("createProject error:", err);
    return res.status(400).json({ message: err.message || "Failed to create project" });
  }
}

/** GET /api/projects (list my projects) */
export async function listMyProjects(req, res) {
  try {
    const docs = await Project.find({ owner: req.user._id })
      .sort({ createdAt: -1 });
    return res.json({ projects: docs });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to list projects" });
  }
}


//test start here

export async function getMyProject(req, res) {
  try {
    const { id } = req.params;
    const doc = await Project.findOne({ _id: id, owner: req.user._id });
    if (!doc) return res.status(404).json({ message: "Project not found" });
    return res.json({ project: doc });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

export async function updateMyProject(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;

    const doc = await Project.findOne({ _id: id, owner: req.user._id });
    if (!doc) return res.status(404).json({ message: "Project not found" });

    // Apply updates (only fields you allow)
    if (body.name != null) doc.name = String(body.name).trim();
    if (body.status != null) doc.status = normalizeStatus(body.status);
    if (body.sdg != null) doc.sdg = Number(body.sdg);
    if (body.start_date !== undefined) doc.start_date = parseDate(body.start_date);
    if (body.end_date !== undefined) doc.end_date = parseDate(body.end_date);
    if (body.budget_amount != null) doc.budget.amount = Number(body.budget_amount);
    if (body.budget_currency != null)
      doc.budget.currency = String(body.budget_currency).toUpperCase();
    if (Array.isArray(body.donors)) doc.donors = body.donors.filter(Boolean).map(String);
    if (body.region != null) doc.region = String(body.region).trim();
    if (body.description != null) doc.description = String(body.description).trim();

    // NEW: beneficiaries
    if (body.target_beneficiaries != null)
      doc.target_beneficiaries = Number(body.target_beneficiaries);
    if (body.achieved_beneficiaries != null)
      doc.achieved_beneficiaries = Number(body.achieved_beneficiaries);

    await doc.save(); // triggers your pre-save validations
    return res.json({ project: doc });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Failed to update project" });
  }
}

//test ends here