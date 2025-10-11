// Axios instance for backend API with smart base URL detection.
// Works for: same PC, Android emulator, and physical device on Wi‑Fi.
import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

function deriveBaseURL() {
  // 1) Explicit env override always wins
  // Prefer Expo's public env var which is bundled by Metro automatically
  if (process.env.EXPO_PUBLIC_API_BASE_URL) return process.env.EXPO_PUBLIC_API_BASE_URL;
  // Fallback to plain API_BASE_URL if a custom Babel plugin is in use
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL;

  // 2) Android emulator special loopback (NOT for physical devices)
  // Constants.isDevice === false on emulators/simulators
  if (Platform.OS === "android" && Constants?.isDevice === false) {
    // If running in an emulator, 10.0.2.2 maps to host's 127.0.0.1
    return "http://10.0.2.2:4000/api";
  }

  // 3) Try to extract LAN IP from Expo hostUri (works for physical devices on same Wi‑Fi)
  try {
    const hostUri =
      (Constants?.expoConfig && Constants.expoConfig.hostUri) ||
      (Constants?.manifest && (Constants.manifest.hostUri || Constants.manifest.debuggerHost)) ||
      (Constants?.expoGo && Constants.expoGo.hostUri) ||
      null;
    if (hostUri) {
      const ipMatch = hostUri.match(/((?:\d{1,3}\.){3}\d{1,3})/);
      if (ipMatch && ipMatch[1]) {
        return `http://${ipMatch[1]}:4000/api`;
      }
    }
  } catch (e) {
    // ignore and fall through
  }

  // 4) Fallbacks
  // Same-PC development default
  if (__DEV__) return "http://127.0.0.1:4000/api";

  // Production/unknown: use last known LAN IP (customize if needed)
  // You can set API_BASE_URL env to override this explicitly.
  return "http://10.95.61.40:4000/api";
}

export const API_BASE_URL = deriveBaseURL();
export const api = axios.create({ baseURL: API_BASE_URL, timeout: 20000 });

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log("[API] baseURL:", API_BASE_URL);
}

// helper to attach token
export function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

// minimal retry on network errors/timeouts once
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const cfg = error?.config || {};
    const isNetwork = error?.code === 'ECONNABORTED' || error?.message?.includes('Network Error');
    if (!cfg.__retried && isNetwork) {
      cfg.__retried = true;
      // small backoff
      await new Promise((r) => setTimeout(r, 300));
      return api.request(cfg);
    }
    return Promise.reject(error);
  }
);
