// ESM
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const SALT_ROUNDS = 10;

export async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function signToken(user) {
  const payload = { sub: user.id, role: user.role };
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES || "1d";
  return jwt.sign(payload, secret, { expiresIn });
}

export async function createUser({
  fullName,
  email,
  password,
  role = "DONOR",
  //organizationName,
}) {
  const exists = await User.findOne({ email });
  if (exists) throw new Error("Email already in use");
  const passwordHash = await hashPassword(password);
  const user = await User.create({
    fullName,
    email,
    passwordHash,
    role,
    //organizationName,
  });
  return user;
}
  
