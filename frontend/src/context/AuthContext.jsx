/* eslint-disable react-refresh/only-export-components */
// src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { authService } from "../services/api";
import { disconnectCable } from "../services/cable";

export const AuthContext = createContext(null);

const initialState = {
  user:    JSON.parse(localStorage.getItem("user") || "null"),
  token:   localStorage.getItem("token") || null,
  loading: false,
  error:   null,
};

function authReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload, error: null };
    case "LOGIN_SUCCESS":
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false, error: null };
    case "LOGOUT":
      return { ...state, user: null, token: null, loading: false, error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Persist auth state to localStorage
  useEffect(() => {
    if (state.token) {
      localStorage.setItem("token", state.token);
      localStorage.setItem("user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [state.token, state.user]);

  // Listen for global logout events (e.g., 401 from axios interceptor)
  useEffect(() => {
    const handler = () => dispatch({ type: "LOGOUT" });
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, []);

  const login = useCallback(async (credentials) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const { data } = await authService.login(credentials);
      dispatch({ type: "LOGIN_SUCCESS", payload: data.data });
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed";
      dispatch({ type: "SET_ERROR", payload: msg });
      throw new Error(msg);
    }
  }, []);

  const register = useCallback(async (userData) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const { data } = await authService.register(userData);
      dispatch({ type: "LOGIN_SUCCESS", payload: data.data });
    } catch (err) {
      const msg = err.response?.data?.errors?.[0] || err.response?.data?.error || "Registration failed";
      dispatch({ type: "SET_ERROR", payload: msg });
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch (_) {}
    disconnectCable();
    dispatch({ type: "LOGOUT" });
  }, []);

  const clearError = useCallback(() => dispatch({ type: "SET_ERROR", payload: null }), []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};