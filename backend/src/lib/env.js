// Centralized .env loader to ensure env vars are available in any module that needs them
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env is located in backend/src/.env
dotenv.config({ path: path.join(__dirname, "../.env") });

// No exports; side-effect only
