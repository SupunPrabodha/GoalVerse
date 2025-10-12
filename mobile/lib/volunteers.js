// volunteers.js
// API logic for saving volunteer profile
import { API_BASE_URL } from "./api";
import { getToken } from "./auth";

export async function saveVolunteerProfile({ age, skills, district, availability }) {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE_URL}/volunteer/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ age, skills, district, availability }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || "Failed to save profile";
    const err = new Error(msg);
    err.data = data;
    throw err;
  }
  return data;
}
