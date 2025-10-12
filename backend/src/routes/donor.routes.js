// src/routes/donor.routes.js
import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { upsertDonorProfile, getMyDonorProfile } from "../controllers/donor.controller.js";

const router = Router();

// Create or update donor profile
router.post("/profile", authenticate, upsertDonorProfile);

// Get my donor profile
router.get("/me", authenticate, getMyDonorProfile);

export default router;
