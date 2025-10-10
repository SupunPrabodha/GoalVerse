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

const router = Router();

// Public
router.post("/signup", signupValidators, signup);
router.post("/login", loginValidators, login);

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
