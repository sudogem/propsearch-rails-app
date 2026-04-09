// src/components/layout/Navbar.js
import React, { useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWatchlist } from "../../context/WatchlistContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { ids }          = useWatchlist();
  const location         = useLocation();
  const navigate         = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/");
    setMenuOpen(false);
  }, [logout, navigate]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L26 11V26H18V18H10V26H2V11L14 2Z" fill="currentColor"/>
          </svg>
          Landchecker
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links">
          {user && (
            <Link to="/watchlist" className={`nav-link ${isActive("/watchlist") ? "active" : ""}`}>
              Watchlist
              {ids.size > 0 && <span className="badge">{ids.size}</span>}
            </Link>
          )}
        </div>

        {/* Auth controls */}
        <div className="navbar-auth">
          {user ? (
            <div className="user-menu" onMouseLeave={() => setMenuOpen(false)}>
              <button className="user-btn" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="avatar">{user.first_name?.[0]}{user.last_name?.[0]}</div>
                <span className="user-name">{user.first_name}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              {menuOpen && (
                <div className="dropdown">
                  <div className="dropdown-header">{user.full_name || `${user.first_name} ${user.last_name}`}</div>
                  <div className="dropdown-email">{user.email}</div>
                  <hr className="dropdown-divider" />
                  <Link to="/watchlist" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    My Watchlist
                    {ids.size > 0 && <span className="badge small">{ids.size}</span>}
                  </Link>
                  <button className="dropdown-item danger" onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="btn-primary-sm">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}