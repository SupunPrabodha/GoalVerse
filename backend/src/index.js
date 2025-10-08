import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./lib/db.js";
import cors from "cors"; 
import job from "./lib/cron.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load .env from same folder
dotenv.config({ path: path.join(__dirname, "./.env") });

console.log("Loaded MONGO_URI:", process.env.MONGO_URI); // debug

const app = express();
const PORT = process.env.PORT || 3000;

job.start(); // Start the cron job
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
