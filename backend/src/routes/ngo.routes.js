// src/routes/ngo.routes.js
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { authenticate, requireRole } from "../middleware/auth.js";
import { upsertNGOProfile, getMyNGOProfile } from "../controllers/ngo.controller.js";
import { getNGODashboard, listNGOEvidence } from "../controllers/dashboard.controller.js";
import Campaign from "../models/Campaign.js";
import Donation from "../models/Donation.js";

const router = Router();

/** Multer local storage (uploads/logos) */
const uploadDir = path.join(process.cwd(), "uploads", "logos");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ts = Date.now();
    const ext = path.extname(file.originalname || ".png");
    cb(null, `${ts}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// GET my profile
router.get(
  "/me",
  authenticate,
  requireRole("NGO_MANAGER"),
  getMyNGOProfile
);

// GET dashboard data
router.get(
  "/dashboard",
  authenticate,
  requireRole("NGO_MANAGER"),
  getNGODashboard
);

// GET evidence list
router.get(
  "/evidence",
  authenticate,
  requireRole("NGO_MANAGER"),
  listNGOEvidence
);

// Campaigns: list and create
router.get(
  "/campaigns",
  authenticate,
  requireRole("NGO_MANAGER"),
  async (req, res) => {
    try {
      const campaigns = await Campaign.find({ ngo_id: req.user._id }).sort({ createdAt: -1 });
      res.json({ campaigns });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post(
  "/campaigns",
  authenticate,
  requireRole("NGO_MANAGER"),
  async (req, res) => {
    try {
      const { title, category, budgetCents } = req.body;
      const c = await Campaign.create({ ngo_id: req.user._id, title, category, budgetCents });
      res.status(201).json({ campaign: c });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Donations: list
router.get(
  "/donations",
  authenticate,
  requireRole("NGO_MANAGER"),
  async (req, res) => {
    try {
      const donations = await Donation.find({ ngo_id: req.user._id }).sort({ createdAt: -1 }).limit(50);
      res.json({ donations });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// CREATE/UPDATE my profile (multipart)
router.post(
  "/me",
  authenticate,
  requireRole("NGO_MANAGER"),
  upload.single("organization_logo"),
  upsertNGOProfile
);

export default router;
