// src/services/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authService = {
  register: (data) => api.post("/auth/register", { user: data }),
  login:    (data) => api.post("/auth/login",    { auth: data }),
  logout:   ()     => api.delete("/auth/logout"),
  me:       ()     => api.get("/auth/me"),
};

// ── Properties ───────────────────────────────────────────────────────────────

export const propertyService = {
  list: (params = {}) =>
    api.get("/properties", { params }).then((r) => r.data),

  featured: () =>
    api.get("/properties/featured").then((r) => r.data),

  get: (id) =>
    api.get(`/properties/${id}`).then((r) => r.data),
};

// ── Watchlist ─────────────────────────────────────────────────────────────────

export const watchlistService = {
  list: (params = {}) =>
    api.get("/watchlist", { params }).then((r) => r.data),

  add: (propertyId) =>
    api.post("/watchlist", { property_id: propertyId }).then((r) => r.data),

  remove: (propertyId) =>
    api.delete(`/watchlist/${propertyId}`).then((r) => r.data),
};

export default api;