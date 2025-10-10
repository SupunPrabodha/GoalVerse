import NGOManagerProfile from "../models/NGOManagerProfile.js";
import Evidence from "../models/Evidence.js";
import User from "../models/User.js";
import Campaign from "../models/Campaign.js";
import Donation from "../models/Donation.js";
import Report from "../models/Report.js";

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
