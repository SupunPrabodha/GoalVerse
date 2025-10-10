// mobile/lib/ngo.js
import { API_BASE_URL } from "./api";
import { getToken } from "./auth";

export async function saveNGOProfile({ organization_name, address, contact_number, sdgs, logo }) {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  const form = new FormData();
  form.append("organization_name", organization_name);
  if (address) form.append("address", address);
  if (contact_number) form.append("contact_number", contact_number);

  // server accepts JSON or comma-separated list – send JSON string for clarity
  if (Array.isArray(sdgs)) form.append("sdgs", JSON.stringify(sdgs));

  if (logo && logo.uri) {
    // RN/Expo FormData file object
    const name = logo.fileName || "logo.jpg";
    form.append("organization_logo", {
      uri: logo.uri,
      name,
      type: logo.mimeType || "image/jpeg",
    });
  }

  const res = await fetch(`${API_BASE_URL}/ngo/me`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // DO NOT set Content-Type here; let fetch set the multipart boundary
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
  return data; // { message, profile, user }
}
