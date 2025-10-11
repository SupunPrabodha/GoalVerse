// ESM
import { Router } from "express";
import {
  signup,
  signupValidators,
  login,
  loginValidators,
  me,
  //completeOrgProfile,
  //completeOrgValidators,
} from "../controllers/auth.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { isDbReady } from "../lib/db.js";

const router = Router();

// DB readiness guard for auth ops
function requireDbReady(req, res, next) {
  if (!isDbReady()) {
    return res.status(503).json({ message: 'Database not connected. Please try again shortly.' });
  }
  next();
}

// Public
router.post("/signup", requireDbReady, signupValidators, signup);
router.post("/login", requireDbReady, loginValidators, login);

// Private
router.get("/me", authenticate, me);

// NGO Manager only: complete org setup
// router.post(
//   "/org/complete",
//   authenticate,
//   requireRole("NGO_MANAGER"),
//   completeOrgValidators,
//   completeOrgProfile
// );

export default router;
