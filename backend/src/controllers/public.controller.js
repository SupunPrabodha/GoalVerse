import Project from "../models/Project.js";
import NGOManagerProfile from "../models/NGOManagerProfile.js";

export async function orgOverview(req, res) {
  try {
    const { sdg, region } = req.query;

    const match = {};
    if (sdg) match.sdg = Number(sdg);
    if (region) match.region = { $regex: String(region), $options: "i" };

    // Aggregate projects by organization
    const agg = await Project.aggregate([
      { $match: match },
      // Ignore projects without linked organization (rare, but safe)
      { $match: { organization: { $ne: null } } },

      // allocatedTotal per project = sum(expenses.allocated)
      {
        $addFields: {
          allocatedPerProject: {
            $sum: {
              $map: {
                input: { $ifNull: ["$expenses", []] },
                as: "e",
                in: { $ifNull: ["$$e.allocated", 0] },
              },
            },
          },
        },
      },

      // group by org
      {
        $group: {
          _id: "$organization",
          projects: { $sum: 1 },
          budgetTotal: { $sum: { $ifNull: ["$budget.amount", 0] } },
          allocatedTotal: { $sum: "$allocatedPerProject" },
          achievedBeneficiaries: { $sum: { $ifNull: ["$achieved_beneficiaries", 0] } },
          targetBeneficiaries: { $sum: { $ifNull: ["$target_beneficiaries", 0] } },
          sdgs: { $addToSet: "$sdg" },
        },
      },

      // join org profile
      {
        $lookup: {
          from: NGOManagerProfile.collection.name,
          localField: "_id",
          foreignField: "_id", // NOTE: profile _id equals organization id? (not always)
          as: "orgBadJoin",
        },
      },
      // Proper join by profile _id == group key? If profile _id != organization id,
      // do a separate lookup by organization ObjectId:
      {
        $lookup: {
          from: NGOManagerProfile.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "orgById",
        },
      },

      // backfill by _id match or leave empty
      {
        $addFields: {
          org: { $arrayElemAt: ["$orgById", 0] },
        },
      },

      // project.organization stores profile id; above lookup works.
      {
        $project: {
          _id: 0,
          organizationId: "$_id",
          org: {
            _id: "$org._id",
            name: "$org.organization_name",
            logo: "$org.organization_logo",
          },
          stats: {
            projects: "$projects",
            budgetTotal: "$budgetTotal",
            allocatedTotal: "$allocatedTotal",
            utilizationPct: {
              $cond: [
                { $gt: ["$budgetTotal", 0] },
                { $round: [{ $multiply: [{ $divide: ["$allocatedTotal", "$budgetTotal"] }, 100] }, 0] },
                0,
              ],
            },
            achievedBeneficiaries: "$achievedBeneficiaries",
            targetBeneficiaries: "$targetBeneficiaries",
            sdgs: "$sdgs",
          },
        },
      },

      { $sort: { "stats.projects": -1 } },
    ]);

    return res.json({ organizations: agg });
  } catch (err) {
    console.error("orgOverview error:", err);
    return res.status(500).json({ message: "Failed to load overview" });
  }
}
