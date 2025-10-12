import { API_BASE_URL } from "./api";
import { getToken } from "./auth";

export async function fetchOrgOverview(filters = {}) {
  const token = await getToken().catch(() => null); // optional auth
  const qs = new URLSearchParams();
  if (filters.sdg) qs.set("sdg", String(filters.sdg));
  if (filters.region) qs.set("region", String(filters.region));
  const url = `${API_BASE_URL}/public/org-overview${qs.toString() ? `?${qs}` : ""}`;

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Failed to load overview");
  return data.organizations || [];
}

export async function fetchOrgProjects(orgId, filters = {}) {
  const qs = new URLSearchParams();
  if (filters.sdg) qs.set("sdg", String(filters.sdg));
  if (filters.region) qs.set("region", String(filters.region));
  const url = `${API_BASE_URL}/public/orgs/${orgId}/projects${qs.toString() ? `?${qs}` : ""}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Failed to load projects");
  return data.projects || [];
}

export async function fetchPublicProject(projectId) {
  const res = await fetch(`${API_BASE_URL}/public/projects/${projectId}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Failed to load project");
  return data.project;
}