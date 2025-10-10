// src/routes/ngo.routes.js
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { authenticate, requireRole } from "../middleware/auth.js";
import { upsertNGOProfile, getMyNGOProfile } from "../controllers/ngo.controller.js";

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

// CREATE/UPDATE my profile (multipart)
router.post(
  "/me",
  authenticate,
  requireRole("NGO_MANAGER"),
  upload.single("organization_logo"),
  upsertNGOProfile
);

export default router;
