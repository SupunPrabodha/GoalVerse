// src/routes/volunteer.routes.js
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate } from "../middleware/auth.js";
import { upsertVolunteerProfile, getMyVolunteerProfile } from "../controllers/volunteer.controller.js";

// Multer local storage (uploads/logos)
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

const router = Router();

// Create or update volunteer profile (multipart for picture upload)
router.post("/profile", authenticate, upload.single("profile_picture"), upsertVolunteerProfile);

// Get my volunteer profile
router.get("/me", authenticate, getMyVolunteerProfile);

export default router;
