// src/routes/volunteer.routes.js
import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { upsertVolunteerProfile, getMyVolunteerProfile } from "../controllers/volunteer.controller.js";

const router = Router();

// Create or update volunteer profile
router.post("/profile", authenticate, upsertVolunteerProfile);

// Get my volunteer profile
router.get("/me", authenticate, getMyVolunteerProfile);

export default router;
