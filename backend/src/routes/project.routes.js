// backend/src/routes/project.routes.js
import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { createProject, listMyProjects, getMyProject, updateMyProject, listAllProjects } from "../controllers/project.controller.js";
import { addExpenseCategory, updateExpenseCategory, removeExpenseCategory,} from "../controllers/project.expenses.controller.js";

const router = Router();

router.get("/all", listAllProjects);
router.post("/", authenticate, requireRole("NGO_MANAGER"), createProject);
router.get("/", authenticate, requireRole("NGO_MANAGER"), listMyProjects);

// router.get("/", authenticate, requireRole("NGO_MANAGER"), listMyProjects);

//test start here

router.get("/:id", authenticate, requireRole("NGO_MANAGER"), getMyProject);
router.patch("/:id", authenticate, requireRole("NGO_MANAGER"), updateMyProject);

//test end here

router.post("/:id/expenses", authenticate, requireRole("NGO_MANAGER"), addExpenseCategory);
router.patch("/:id/expenses/:expId", authenticate, requireRole("NGO_MANAGER"), updateExpenseCategory);
router.delete("/:id/expenses/:expId", authenticate, requireRole("NGO_MANAGER"), removeExpenseCategory);

export default router;
