// src/App.js
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import { WatchlistProvider } from "./context/WatchlistContext";
import Navbar from "./components/layout/Navbar";
import LoadingSpinner from "./components/ui/LoadingSpinner";

// Code-split pages for performance
const SearchPage    = lazy(() => import("./components/property/SearchPage"));
const PropertyDetail = lazy(() => import("./components/property/PropertyDetail"));
const WatchlistPage = lazy(() => import("./components/watchlist/WatchlistPage"));
const AuthPage      = lazy(() => import("./components/auth/AuthPage"));

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Suspense fallback={<LoadingSpinner fullPage />}>
        <Routes>
          <Route path="/"           element={<SearchPage />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/auth"       element={<AuthPage />} />
          <Route path="/watchlist"  element={
            <ProtectedRoute><WatchlistPage /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <AppRoutes />
      </WatchlistProvider>
    </AuthProvider>
  );
}