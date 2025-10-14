import axios from "axios";

export const API_BASE_URL = "https://nasa-api-bnot.onrender.com/api"; // <- set to your laptop's IP
export const api = axios.create({ baseURL: API_BASE_URL });

// helper to attach token
export function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}
