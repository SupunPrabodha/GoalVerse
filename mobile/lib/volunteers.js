// volunteers.js
// API logic for saving volunteer profile
import { API_BASE_URL } from "./api";
import { getToken } from "./auth";

export async function saveVolunteerProfile({ age, skills, district, availability, profile_picture }) {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  const form = new FormData();
  if (age) form.append("age", age);
  if (skills) form.append("skills", JSON.stringify(skills));
  if (district) form.append("district", district);
  if (availability) form.append("availability", availability);
  if (profile_picture && profile_picture.uri) {
    const name = profile_picture.fileName || "profile.jpg";
    form.append("profile_picture", {
      uri: profile_picture.uri,
      name,
      type: profile_picture.mimeType || "image/jpeg",
    });
  }

  const res = await fetch(`${API_BASE_URL}/volunteer/profile`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // DO NOT set Content-Type for FormData
    },
    body: form,
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
