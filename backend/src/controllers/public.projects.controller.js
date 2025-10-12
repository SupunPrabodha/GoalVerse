// ESM
import Project from "../models/Project.js";
import NGOManagerProfile from "../models/NGOManagerProfile.js";

/** GET /api/public/orgs/:orgId/projects?sdg=&region= */
export async function listOrgProjects(req, res) {
  try {
    const { orgId } = req.params;
    const { sdg, region } = req.query;

    const match = { organization: orgId };
    if (sdg) match.sdg = Number(sdg);
    if (region) match.region = { $regex: String(region), $options: "i" };

    const projects = await Project.find(match)
      .select("name sdg region start_date end_date budget donors target_beneficiaries achieved_beneficiaries status")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ projects });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load projects" });
  }
}

/** GET /api/public/projects/:id */
export async function getPublicProject(req, res) {
  try {
    const p = await Project.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ message: "Project not found" });

    const org = p.organization
      ? await NGOManagerProfile.findById(p.organization)
          .select("organization_name organization_logo").lean()
      : null;

    return res.json({
      project: {
        ...p,
        organization: org
          ? { id: org._id, name: org.organization_name, logo: org.organization_logo }
          : null,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load project" });
  }
}
