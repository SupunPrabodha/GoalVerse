// // mobile/lib/projects.js
// import { API_BASE_URL } from "./api";
// import { getToken } from "./auth";

// export async function createProject(payload) {
//   const token = await getToken();
//   if (!token) throw new Error("Not authenticated");

//   const res = await fetch(`${API_BASE_URL}/projects`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify(payload),
//   });

//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) {
//     const msg = data?.message || "Failed to create project";
//     const err = new Error(msg);
//     err.data = data;
//     throw err;
//   }
//   return data.project;
// }
 
// //test start here
// export async function listMyProjects() {
//   const token = await getToken();
//   const res = await fetch(`${API_BASE_URL}/projects`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   const data = await res.json();
//   if (!res.ok) throw new Error(data?.message || "Failed to load projects");
//   return data.projects;
// }

// //test end here


// mobile/lib/projects.js
import { API_BASE_URL } from "./api";
import { getToken } from "./auth";

// 🆕 small helper to DRY auth + error handling
async function authedFetch(path, opts = {}) {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }
  return data;
}

// 🔁 unchanged behavior, now using authedFetch
export async function createProject(payload) {
  const { project } = await authedFetch("/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return project;
}

// 🔁 refactor: use authedFetch
export async function listMyProjects() {
  const { projects } = await authedFetch("/projects");
  return projects;
}

// 🆕 get single project by id
export async function getProject(id) {
  const { project } = await authedFetch(`/projects/${id}`);
  return project;
}

// 🆕 update project by id
export async function updateProject(id, payload) {
  const { project } = await authedFetch(`/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return project;
}

// 🆕 (optional) delete project by id
export async function deleteProject(id) {
  await authedFetch(`/projects/${id}`, { method: "DELETE" });
  return true;
}
