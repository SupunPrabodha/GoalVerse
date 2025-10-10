import * as SecureStore from "expo-secure-store";
import { api, authHeaders } from "./api";

// Persist token securely
export async function setToken(token) {
  await SecureStore.setItemAsync("token", token);
}
export async function getToken() {
  return SecureStore.getItemAsync("token");
}
export async function clearToken() {
  await SecureStore.deleteItemAsync("token");
}

// API calls
export async function signup(payload) {
  const { data } = await api.post("/auth/signup", payload);
  await setToken(data.token);
  return data.user;
}

export async function login(payload) {
  const { data } = await api.post("/auth/login", payload);
  await setToken(data.token);
  return data.user;
}

export async function me() {
  const token = await getToken();
  if (!token) return null;
  const { data } = await api.get("/auth/me", authHeaders(token));
  return data.user;
}
