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
//import path from "path";

const __filename = fileURLToPath(import.meta.url);                
const __dirname = path.dirname(__filename);  

dotenv.config({ path: path.join(__dirname, "./.env") });

// If MONGODB_URI missing, warn but continue so the dev server can run without DB for UI work
if (!process.env.MONGODB_URI) {
  console.warn("⚠️ MONGODB_URI is missing. Backend will start but database features will be disabled. Add backend/.env with MONGODB_URI to enable DB.");
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
import publicRoutes from "./routes/public.routes.js";
app.use("/api", publicRoutes);

// Start
const BASE_PORT = Number(process.env.PORT) || 4000;
if (process.env.MONGODB_URI) {
  try {
    await connectDB(process.env.MONGODB_URI);
  } catch (err) {
    console.error('Failed to connect to MongoDB - continuing without DB. Check your MONGODB_URI. Error:', err.message);
  }
} else {
  console.warn('Skipping DB connection (MONGODB_URI not set)');
}

// Try a few sequential ports to avoid conflicts (e.g., 4000..4004)
async function listenWithFallback(startPort = BASE_PORT, attempts = 5) {
  let currentPort = startPort;
  let server;

  while (attempts > 0) {
    try {
      await new Promise((resolve, reject) => {
        server = app
          .listen(currentPort, '0.0.0.0', () => {
            const addr = server.address();
            const host = addr && addr.address ? addr.address : '0.0.0.0';
            const port = addr && addr.port ? addr.port : currentPort;
            console.log(`API listening on http://${host}:${port} (pid=${process.pid})`);
            console.log(`[server:listening] ${host}:${port}`);

            // Lightweight heartbeat so we can see if the process remains alive/listening
            const hb = setInterval(() => {
              const a = server.address();
              const listening = server.listening;
              const h = a && a.address ? a.address : '0.0.0.0';
              const p = a && a.port ? a.port : currentPort;
              console.log(`[heartbeat] listening=${listening} on ${h}:${p} (pid=${process.pid})`);
            }, 15000);
            hb.unref();

            resolve();
          })
          .on('error', (err) => {
            if (err && err.code === 'EADDRINUSE') {
              console.error(`[server:error] ${err.code}: ${err.message} on port ${currentPort}`);
              reject(err);
            } else {
              console.error('[server:error]', err && err.code ? `${err.code}: ${err.message}` : err);
              reject(err);
            }
          })
          .on('close', () => {
            console.warn('[server:close] server has stopped accepting connections');
          });
      });
      // success
      return server;
    } catch (err) {
      attempts -= 1;
      if (attempts <= 0 || !(err && err.code === 'EADDRINUSE')) {
        throw err;
      }
      currentPort += 1; // try next port
      console.warn(`[port:fallback] Retrying on port ${currentPort} (${attempts} attempts left)`);
    }
  }
}

try {
  await listenWithFallback(BASE_PORT, 5);
} catch (err) {
  console.error('Failed to start server:', err && err.message ? err.message : err);
  process.exitCode = 1;
}

// Global error handlers to surface async errors during startup/runtime
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

// Log termination signals for visibility (do not exit explicitly)
process.on('SIGINT', () => {
  console.warn('[signal] SIGINT received');
});
process.on('SIGTERM', () => {
  console.warn('[signal] SIGTERM received');
});
