import NGOManagerProfile from "../models/NGOManagerProfile.js";
import Evidence from "../models/Evidence.js";
import User from "../models/User.js";
import Campaign from "../models/Campaign.js";
import Donation from "../models/Donation.js";
import Report from "../models/Report.js";
import fs from "fs";
import path from "path";

// GET /api/ngo/dashboard
export async function getNGODashboard(req, res) {
  try {
    const user = req.user;
    // Basic aggregations from Evidence and Profile
    const evidenceCounts = await Evidence.aggregate([
      { $match: { ngo_id: user._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const counts = { verified: 0, pending: 0, flagged: 0 };
    for (const c of evidenceCounts) counts[c._id] = c.count;

    // Aggregate campaigns and donations
    const campaigns = await Campaign.find({ ngo_id: user._id });
    const donationsAgg = await Donation.aggregate([
      { $match: { ngo_id: user._id, status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$amountCents" }, count: { $sum: 1 } } },
    ]);
    const donationsTotal = (donationsAgg[0] && donationsAgg[0].total) || 0;

    // Budget breakdown from campaigns
    const budgetBreakdown = campaigns.map((c) => ({ name: c.title, amountCents: c.budgetCents || 0, percent: 0 }));
    const budgetTotal = budgetBreakdown.reduce((s, b) => s + (b.amountCents || 0), 0);
    budgetBreakdown.forEach((b) => {
      b.percent = budgetTotal > 0 ? Math.round((b.amountCents / budgetTotal) * 100) : 0;
    });

    // Reports due count
    const reportsDueCount = await Report.countDocuments({ ngo_id: user._id, status: "DUE" });

    // build upcoming deadlines (from reports)
    const upcomingReports = await Report.find({ ngo_id: user._id, status: "DUE" }).sort({ dueDate: 1 }).limit(5);
    const upcomingDeadlines = upcomingReports.map((r) => ({ id: r._id.toString(), title: r.title, donor: "", dueInDays: Math.max(0, Math.ceil((r.dueDate - Date.now()) / (1000 * 60 * 60 * 24))), actionLabel: "Prepare" }));

    // recent activities from donations
    const recentDonations = await Donation.find({ ngo_id: user._id }).sort({ createdAt: -1 }).limit(5);
    const recentActivities = recentDonations.map((d) => ({ id: d._id.toString(), type: "donation", title: `Donation $${(d.amountCents/100).toFixed(2)}`, date: d.createdAt, amountCents: d.amountCents, status: d.status }));

    return res.json({
      budgetUtilizationPercent: budgetTotal > 0 ? Math.round((donationsTotal / budgetTotal) * 100) : 0,
      budgetTotalCents: budgetTotal,
      budgetUsedCents: donationsTotal,
      partnershipsCount: 0,
      reportsDueCount,
      budgetBreakdown,
      upcomingDeadlines,
      recentActivities,
      evidenceSummary: counts,
      totalEvidenceAmountCents: (await Evidence.aggregate([{ $match: { ngo_id: user._id } }, { $group: { _id: null, sum: { $sum: "$amountCents" } } }]))[0]?.sum || 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/ngo/evidence
export async function listNGOEvidence(req, res) {
  try {
    const user = req.user;
    const limit = Number(req.query.limit || 20);
    const items = await Evidence.find({ ngo_id: user._id }).sort({ createdAt: -1 }).limit(limit);
    return res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/ngo/evidence  (multipart form-data)
export async function createNGOEvidence(req, res) {
  try {
    const user = req.user;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Basic server-side validation: reject executable / script files by extension
    const bannedExt = ['.exe', '.bat', '.sh', '.cmd', '.js'];
    const ext = path.extname(req.file.originalname || '').toLowerCase();
    if (bannedExt.includes(ext)) {
      // remove uploaded file
      try { fs.unlinkSync(req.file.path); } catch(e){}
      return res.status(400).json({ message: 'Disallowed file type' });
    }

    // Optional: try to run an external virus scanner if installed (cli: clamscan)
    try {
      const spawn = await import('child_process').then(m => m.spawn);
      // this will be a best-effort; don't block if scanner missing
      const scanner = spawn('clamscan', ['-v', req.file.path]);
      scanner.on('error', () => {});
      // we won't wait for results synchronously; production should run async job
    } catch (e) {
      // ignore if clamscan not available
    }

    // store relative path for client usage
    const relPath = `/uploads/evidence/${req.file.filename}`;

    const doc = await Evidence.create({
      ngo_id: user._id,
      filename: relPath,
      originalname: req.file.originalname,
      mimeType: req.file.mimetype,
      type: (req.body.type) || 'photo',
      amountCents: Number(req.body.amountCents || 0),
      status: 'pending',
    });

    // enqueue processing (thumbnail/scan) - best-effort
    try {
      const { enqueue } = await import("../lib/processing.queue.js");
      enqueue({ type: 'process-evidence', payload: { filePath: req.file.path, evidenceId: doc._id.toString(), EvidenceModel: Evidence } });
    } catch (e) {
      console.error('failed to enqueue processing', e);
    }

    return res.status(201).json({ item: doc });
  } catch (err) {
    console.error('analyzeEvidence error:', err);
    const msg = (err && err.message) || 'Server error';
    // mongoose validation errors often include errors object
    return res.status(500).json({ message: msg, details: err && err.errors ? err.errors : undefined });
  }
}

// POST /api/ngo/evidence/:id/analyze  -- lightweight AI stub that "analyzes" an evidence and creates a report
export async function analyzeEvidence(req, res) {
  try {
    const user = req.user;
    const id = req.params.id;
    const ev = await Evidence.findById(id);
    if (!ev || ev.ngo_id.toString() !== user._id.toString()) return res.status(404).json({ message: 'Not found' });

    // Fake analysis: if amountCents > 0 mark verified; else randomize
    let analysisStatus = 'pending';
    if (ev.amountCents && ev.amountCents > 0) analysisStatus = 'verified';
    else analysisStatus = Math.random() > 0.7 ? 'flagged' : 'verified';

    ev.status = analysisStatus;
    await ev.save();

    // create a simple report record for this evidence analysis
    const report = await Report.create({
      ngo_id: user._id,
      title: `Analysis: ${ev.originalname || ev._id}`,
      type: 'evidence-analysis',
      dueDate: Date.now(),
      submittedAt: new Date(),
      status: 'COMPLETED',
    });

    return res.json({ evidence: ev, report });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// REPORTS: list & export
export async function listReports(req, res) {
  try {
    const user = req.user;
    const items = await Report.find({ ngo_id: user._id }).sort({ createdAt: -1 }).limit(100);
    return res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getReport(req, res) {
  try {
    const user = req.user;
    const id = req.params.id;
    const r = await Report.findById(id);
    if (!r || r.ngo_id.toString() !== user._id.toString()) return res.status(404).json({ message: 'Not found' });
    return res.json({ report: r });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Export a CSV for the given report (simple CSV of evidence items)
export async function exportReportCSV(req, res) {
  try {
    const user = req.user;
    const id = req.params.id;
    const report = await Report.findById(id);
    if (!report || report.ngo_id.toString() !== user._id.toString()) return res.status(404).json({ message: 'Not found' });

    // for demo: include all evidence for this NGO
    const items = await Evidence.find({ ngo_id: user._id }).sort({ createdAt: -1 }).limit(1000);

    // build CSV
    const header = ['id','originalname','filename','mimeType','type','status','amountCents','createdAt'];
    const rows = items.map((it) => [it._id, it.originalname || '', it.filename || '', it.mimeType || '', it.type || '', it.status || '', it.amountCents || 0, it.createdAt.toISOString()].map((c) => String(c).replace(/\n/g, ' ')));
    const csv = [header.join(','), ...rows.map((r) => r.map((c) => `"${(c+'').replace(/"/g,'""')}"`).join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="report-${report._id}.csv"`);
    return res.send(csv);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
