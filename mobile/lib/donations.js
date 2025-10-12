// Save donor profile (same pattern as NGO/Volunteer)
export async function saveDonorProfile({ organization_name, country, address, funding_focus }) {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${api.defaults.baseURL}/donor/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ organization_name, country, address, funding_focus }),
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