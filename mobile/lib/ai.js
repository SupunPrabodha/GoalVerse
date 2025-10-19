import { API_BASE_URL } from "./api";
import { getToken } from "./auth";

export async function getAISummary({ scope = "project", id, forceRefresh = false }) {
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}/ai/summary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ scope, id, forceRefresh }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Failed to generate summary");
  return data;
}
