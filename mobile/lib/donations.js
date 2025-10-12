// Save donor profile (same pattern as NGO/Volunteer)
export async function saveDonorProfile({ organization_name, country, address, funding_focus, organization_picture }) {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  const form = new FormData();
  form.append("organization_name", organization_name);
  if (country) form.append("country", country);
  if (address) form.append("address", address);
  if (Array.isArray(funding_focus)) form.append("funding_focus", JSON.stringify(funding_focus));
  if (organization_picture && organization_picture.uri) {
    const name = organization_picture.fileName || "picture.jpg";
    form.append("organization_picture", {
      uri: organization_picture.uri,
      name,
      type: organization_picture.mimeType || "image/jpeg",
    });
  }

  const res = await fetch(`${api.defaults.baseURL}/donor/profile`, {
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
import { api, authHeaders } from "./api";
import { getToken } from "./auth";

export async function createDonation({ amountCents, currency = 'USD', note = '', projectId }) {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');
  const { data } = await api.post('/donations', { amountCents, currency, note, projectId }, authHeaders(token));
  return data.donation;
}

export async function listMyDonations() {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');
  const { data } = await api.get('/donations/me', authHeaders(token));
  return data.items || [];
}