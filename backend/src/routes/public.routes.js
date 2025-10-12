import { Router } from "express";
import { orgOverview } from "../controllers/public.controller.js";
import { listOrgProjects, getPublicProject } from "../controllers/public.projects.controller.js";

const router = Router();

// Public read-only endpoint (safe aggregates)
router.get("/org-overview", orgOverview);
router.get("/orgs/:orgId/projects", listOrgProjects);   
router.get("/projects/:id", getPublicProject); 

export default router;
