// ESM entry
import dotenv from "dotenv";
//dotenv.config();
import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";

import ngoRoutes from "./routes/ngo.routes.js";
import projectRoutes from "./routes/project.routes.js"; 
import publicRoutes from "./routes/public.routes.js";
import donationRoutes from "./routes/donation.routes.js";

const __filename = fileURLToPath(import.meta.url);                
const __dirname = path.dirname(__filename);  

dotenv.config({ path: path.join(__dirname, "./.env") });

// Optional: fail fast if missing
if (!process.env.MONGODB_URI) {                                   // 🆕
  console.error("❌ MONGODB_URI is missing. Check backend/.env"); // 🆕
  process.exit(1);                                                // 🆕
}

const app = express();

// Middleware
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    credentials: true,
  })
);
// serve uploaded files (e.g., http://localhost:4000/uploads/logos/filename.png)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.get("/api/health", (_, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/ngo", ngoRoutes);

app.use("/api/projects", projectRoutes);
app.use("/api/public", publicRoutes); 
app.use("/api/donations", donationRoutes);

// Start
const PORT = process.env.PORT || 4000;
await connectDB(process.env.MONGODB_URI);
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
