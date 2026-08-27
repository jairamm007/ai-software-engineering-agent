import axios from "axios";

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

export default api;