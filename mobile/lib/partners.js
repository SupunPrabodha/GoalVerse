import { api, authHeaders } from "./api";
import { getToken } from "./auth";

export async function listReceivedPartnershipRequests() {
  const token = await getToken();
  if (!token) throw new Error("No authentication token found");
  const { data } = await api.get("/partners/received-requests", authHeaders(token));
  return data.requests || [];
}
