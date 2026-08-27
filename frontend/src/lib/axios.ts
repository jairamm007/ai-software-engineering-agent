import axios from "axios";

const SESSION_TOKEN_KEY = "asea.session-token";

export function saveSessionToken(token: string | null | undefined): void {
  if (typeof window === "undefined") return;

  if (token) {
    window.sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  } else {
    window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
  }
}

function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(SESSION_TOKEN_KEY);
}

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
export const API_ORIGIN = configuredApiUrl || (import.meta.env.PROD ? "https://asea-backend.onrender.com" : "");
export const API_BASE_URL = API_ORIGIN ? `${API_ORIGIN}/api` : "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Cookies remain the default. The bearer token makes protected API requests
// reliable when the frontend and API are hosted on different origins.
api.interceptors.request.use((config) => {
  const token = getSessionToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
