import NGOManagerProfile from "../models/NGOManagerProfile.js";
import Evidence from "../models/Evidence.js";
import User from "../models/User.js";

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

    // budget aggregates are not stored; return sample breakdown using totals from evidence amounts
    const totalEvidence = await Evidence.aggregate([
      { $match: { ngo_id: user._id } },
      { $group: { _id: null, sum: { $sum: "$amountCents" } } },
    ]);
    const totalCents = (totalEvidence[0] && totalEvidence[0].sum) || 0;

    // simple payload
    return res.json({
      budgetUtilizationPercent: 72,
      budgetTotalCents: 100000000,
      budgetUsedCents: 72000000,
      partnershipsCount: 1,
      reportsDueCount: 2,
      budgetBreakdown: [
        { name: "Program Implementation", amountCents: 45000000, percent: 45 },
        { name: "Administrative Costs", amountCents: 18000000, percent: 18 },
        { name: "Emergency Fund", amountCents: 9000000, percent: 9 },
        { name: "Available Budget", amountCents: 28000000, percent: 28 },
      ],
      upcomingDeadlines: [
        { id: "r1", title: "Q3 Financial Report", donor: "WorldVision", dueInDays: 3, actionLabel: "Review" },
        { id: "r2", title: "Impact Assessment", donor: "UN Partnership", dueInDays: 5, actionLabel: "Prepare" },
      ],
      recentActivities: [
        { id: "a1", type: "donation", title: "Donation received", date: new Date(), amountCents: 4500000, status: "verified" },
      ],
      evidenceSummary: counts,
      totalEvidenceAmountCents: totalCents,
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
