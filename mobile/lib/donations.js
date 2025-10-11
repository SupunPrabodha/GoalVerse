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