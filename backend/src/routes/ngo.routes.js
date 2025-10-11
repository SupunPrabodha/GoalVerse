// src/routes/ngo.routes.js
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { authenticate, requireRole } from "../middleware/auth.js";
import { upsertNGOProfile, getMyNGOProfile } from "../controllers/ngo.controller.js";
import { getNGODashboard, listNGOEvidence, createNGOEvidence, analyzeEvidence, listReports, getReport, exportReportCSV } from "../controllers/dashboard.controller.js";
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for logos
});

// Multer store for evidence files
const evidenceDir = path.join(process.cwd(), "uploads", "evidence");
fs.mkdirSync(evidenceDir, { recursive: true });
const evidenceStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, evidenceDir),
  filename: (_, file, cb) => {
    const ts = Date.now();
    const ext = path.extname(file.originalname || ".png");
    cb(null, `${ts}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

// Allowed MIME types and extensions for evidence uploads
const ALLOWED_EVIDENCE_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'video/mp4',
  'application/pdf',
]);
const ALLOWED_EVIDENCE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.mp4', '.pdf']);
const BANNED_EXTS = new Set(['.exe', '.bat', '.sh', '.cmd', '.js']);

function evidenceFileFilter(req, file, cb) {
  const mimetypeRaw = (file && file.mimetype) || '';
  const mimetype = String(mimetypeRaw).toLowerCase().split(';')[0];
  const orig = (file && file.originalname) || '';
  const ext = (orig && String(orig).toLowerCase().includes('.') ? path.extname(orig).toLowerCase() : '');

  // immediate reject banned extensions
  if (ext && BANNED_EXTS.has(ext)) {
    const err = new Error('Disallowed file type');
    err.status = 400;
    return cb(err, false);
  }

  // accept when extension is allowed (primary validation for mobile where mime may vary)
  if (ext && ALLOWED_EVIDENCE_EXTS.has(ext)) return cb(null, true);

  // accept when mimetype is known and allowed
  if (mimetype && ALLOWED_EVIDENCE_MIMES.has(mimetype)) return cb(null, true);

  // special-case generic mime from some pickers
  if (mimetype === 'application/octet-stream' && ext && ALLOWED_EVIDENCE_EXTS.has(ext)) return cb(null, true);

  const err = new Error('Invalid file type');
  err.status = 400;
  return cb(err, false);
}

const evidenceUpload = multer({ storage: evidenceStorage, limits: { fileSize: 25 * 1024 * 1024 }, fileFilter: evidenceFileFilter });

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
  requireRole("NGO_MANAGER", "VOLUNTEER", "DONOR"),
  listNGOEvidence
);

// Upload evidence (photo/document)
router.post(
  "/evidence",
  authenticate,
  requireRole("NGO_MANAGER", "VOLUNTEER", "DONOR"),
  // wrap multer to capture errors and return JSON
  (req, res, next) => {
    evidenceUpload.single("file")(req, res, (err) => {
      if (err) {
        const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 413 : 400);
        return res.status(status).json({ message: err.message || 'Upload error', code: err.code || 'UPLOAD_ERROR' });
      }
      // basic log
      if (req.file) {
        console.log(`[upload] evidence ${req.file.originalname} -> ${req.file.filename} (${req.file.mimetype}, ${req.file.size}b)`);
      }
      next();
    });
  },
  createNGOEvidence
);

// Analyze an evidence item (AI stub)
router.post(
  "/evidence/:id/analyze",
  authenticate,
  requireRole("NGO_MANAGER"),
  analyzeEvidence
);

// Reports
router.get(
  "/reports",
  authenticate,
  requireRole("NGO_MANAGER"),
  listReports
);

router.get(
  "/reports/:id",
  authenticate,
  requireRole("NGO_MANAGER"),
  getReport
);

router.get(
  "/reports/:id/export",
  authenticate,
  requireRole("NGO_MANAGER"),
  exportReportCSV
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
