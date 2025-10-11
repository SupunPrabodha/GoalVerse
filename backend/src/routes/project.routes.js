// backend/src/routes/project.routes.js
import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { createProject, listMyProjects, getMyProject, updateMyProject } from "../controllers/project.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  requireRole("NGO_MANAGER"),
  createProject
);

router.get(
  "/",
  authenticate,
  requireRole("NGO_MANAGER"),
  listMyProjects
);

// router.post("/", authenticate, requireRole("NGO_MANAGER"), createProject);

// router.get("/", authenticate, requireRole("NGO_MANAGER"), listMyProjects);

//test start here

router.get("/:id", authenticate, requireRole("NGO_MANAGER"), getMyProject);       // NEW

router.patch("/:id", authenticate, requireRole("NGO_MANAGER"), updateMyProject);

//test end here

export default router;
