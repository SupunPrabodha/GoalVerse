// ESM
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized", error: err.message });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
}
