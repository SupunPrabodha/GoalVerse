// ESM
import { body, validationResult } from "express-validator";
import {
  createUser,
  verifyPassword,
  signToken,
} from "../services/auth.service.js";
import User from "../models/User.js";

export const signupValidators = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  body("role").optional().isString(),
  body("fullName").optional().isString(),
  //body("organizationName").optional().isString(),
];

export async function signup(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { fullName, email, password, role /*organizationName*/ } = req.body;
    const user = await createUser({ fullName, email, password, role /*organizationName*/ });
    const token = signToken(user);
    return res.status(201).json({ user: user.toPublic(), token });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

export const loginValidators = [body("email").isEmail(), body("password").notEmpty()];

export async function login(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const user = await User.findOne({ email }).lean(false);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(user);
    return res.json({ user: user.toPublic(), token });
  } catch (err) {
    // Normalize mongoose buffering/server selection errors to a clean message
    const msg = /buffering timed out|Server selection timed out|ECONNREFUSED/i.test(err.message)
      ? 'Database temporarily unavailable. Please try again.'
      : err.message;
    return res.status(503).json({ message: msg });
  }
}

export async function me(req, res) {
  return res.json({ user: req.user.toPublic() });
}

// export const completeOrgValidators = [
//   body("organizationName").isString().notEmpty(),
//   body("sdgs").optional().isArray(),
//   body("logoUrl").optional().isString(),
// ];

// export async function completeOrgProfile(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//     const { organizationName, sdgs = [], logoUrl } = req.body;
//     req.user.organizationName = organizationName;
//     req.user.sdgs = sdgs;
//     if (logoUrl) req.user.logoUrl = logoUrl;
//     req.user.isOrgProfileComplete = true;
//     await req.user.save();
//     return res.json({ user: req.user.toPublic() });
//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
// }
