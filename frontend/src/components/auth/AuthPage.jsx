// src/components/auth/AuthPage.js
import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AuthPage() {
  const [mode, setMode]         = useState("login"); // "login" | "register"
  const [formData, setFormData] = useState({ email: "", password: "", first_name: "", last_name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const { login, register, error: authError, clearError } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const returnTo  = location.state?.from || "/";

  const displayError = localError || authError;

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError("");
    clearError();
  }, [clearError]);

  const validate = () => {
    if (!formData.email)    return "Email is required";
    if (!formData.password) return "Password is required";
    if (mode === "register") {
      if (!formData.first_name) return "First name is required";
      if (!formData.last_name)  return "Last name is required";
      if (formData.password.length < 8) return "Password must be at least 8 characters";
    }
    return null;
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setLocalError(err); return; }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register(formData);
      }
      navigate(returnTo, { replace: true });
    } catch (err) {
      // Error is already in AuthContext
    } finally {
      setSubmitting(false);
    }
  }, [mode, formData, login, register, navigate, returnTo]);

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setLocalError("");
    clearError();
  };

  const fillDemo = () => {
    setFormData({ email: "demo@landchecker.com", password: "password123", first_name: "", last_name: "" });
    setLocalError("");
    clearError();
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        {/* Left panel */}
        <div className="auth-left">
          <div className="auth-brand">
            <svg width="40" height="40" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L26 11V26H18V18H10V26H2V11L14 2Z" fill="currentColor"/>
            </svg>
            <span>Landchecker</span>
          </div>
          <h2 className="auth-tagline">Your dream home awaits</h2>
          <p className="auth-subtagline">Join thousands discovering their perfect property</p>
          <div className="auth-features">
            {["Search thousands of listings", "Save favorites to your watchlist", "Get real-time notifications"].map((f) => (
              <div key={f} className="auth-feature">
                <span className="feature-check">✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel - form */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <h1 className="auth-title">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="auth-subtitle">
              {mode === "login"
                ? "Sign in to access your watchlist"
                : "Start saving your favorite properties"
              }
            </p>

            {displayError && (
              <div className="auth-error">{displayError}</div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {mode === "register" && (
                <div className="form-row two-col">
                  <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input
                      id="first_name" type="text" name="first_name"
                      placeholder="Juan" value={formData.first_name}
                      onChange={handleChange} autoComplete="given-name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                      id="last_name" type="text" name="last_name"
                      placeholder="dela Cruz" value={formData.last_name}
                      onChange={handleChange} autoComplete="family-name"
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email" type="email" name="email"
                  placeholder="you@example.com" value={formData.email}
                  onChange={handleChange} autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password" type="password" name="password"
                  placeholder={mode === "register" ? "Min. 8 characters" : "Your password"}
                  value={formData.password} onChange={handleChange}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>

              <button type="submit" className="btn-auth" disabled={submitting}>
                {submitting
                  ? (mode === "login" ? "Signing in…" : "Creating account…")
                  : (mode === "login" ? "Sign In" : "Create Account")
                }
              </button>
            </form>

            {mode === "login" && (
              <button className="demo-btn" onClick={fillDemo}>
                Use demo account
              </button>
            )}

            <p className="auth-switch">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button className="link-btn" onClick={switchMode}>
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
