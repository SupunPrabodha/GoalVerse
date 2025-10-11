// Simple axios instance for your backend API.
// If you test on a physical phone, use your PC's LAN IP (e.g. 192.168.1.10).
import axios from "axios";

<<<<<<< Updated upstream
export const API_BASE_URL = "http://172.24.47.164:4000/api"; // <= change this
=======
export const API_BASE_URL = "http://172.20.10.3:4000/api"; // <- set to your laptop's IP
>>>>>>> Stashed changes
export const api = axios.create({ baseURL: API_BASE_URL });

// helper to attach token
export function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}
