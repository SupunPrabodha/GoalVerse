import axios from "axios";

export const API_BASE_URL = "http://172.24.47.164:4000/api"; // <- set to your laptop's IP
export const api = axios.create({ baseURL: API_BASE_URL });

// helper to attach token
export function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}
