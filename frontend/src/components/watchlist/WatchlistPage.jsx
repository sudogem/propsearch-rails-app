// src/components/watchlist/WatchlistPage.js
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useWatchlist } from "../../context/WatchlistContext";
import { useAuth } from "../../context/AuthContext";
import PropertyCard from "../property/PropertyCard";
import LoadingSpinner from "../ui/LoadingSpinner";
import { watchlistService } from "../../services/api";
import { useIntersectionObserver } from "../../hooks";

const PER_PAGE = 12;

export default function WatchlistPage() {
  const { user }                     = useAuth();
  const { refreshWatchlist }         = useWatchlist();
  const [properties,   setProperties]   = useState([]);
  const [meta,         setMeta]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [error,        setError]        = useState(null);
  const [page,         setPage]         = useState(1);

  // Initial load
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    watchlistService.list({ page: 1, per_page: PER_PAGE })
      .then((d) => { setProperties(d.data || []); setMeta(d.meta || null); })
      .catch(() => setError("Failed to load watchlist"))
      .finally(() => setLoading(false));
  }, [user]);

  const hasMore = meta ? page < meta.total_pages : false;

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const d = await watchlistService.list({ page: nextPage, per_page: PER_PAGE });
      setProperties((prev) => [...prev, ...(d.data || [])]);
      setMeta(d.meta || null);
      setPage(nextPage);
    } catch (_) {}
    finally { setLoadingMore(false); }
  }, [loadingMore, hasMore, page]);

  const sentinelRef = useIntersectionObserver(loadMore);

  // When a property is removed via card button, update local list too
  const handleRemove = useCallback((propertyId) => {
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    setMeta((prev) => prev ? { ...prev, total_count: prev.total_count - 1 } : prev);
    refreshWatchlist();
  }, [refreshWatchlist]);

  return (
    <main className="watchlist-page">
      <div className="page-container">
        <header className="watchlist-header">
          <div>
            <h1 className="page-title">My Watchlist</h1>
            <p className="page-subtitle">
              {meta?.total_count
                ? `${meta.total_count} saved propert${meta.total_count === 1 ? "y" : "ies"}`
                : "Properties you've saved"
              }
            </p>
          </div>
          <Link to="/" className="btn-secondary">Browse More</Link>
        </header>

        {error && (
          <div className="error-state">
            <p>⚠️ {error}</p>
            <button className="btn-secondary" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {!loading && properties.length === 0 && !error && (
          <div className="empty-state watchlist-empty">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <path d="M32 56S8 42 8 24a16 16 0 0 1 24-13.86A16 16 0 0 1 56 24C56 42 32 56 32 56z"
                  stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.3"/>
              </svg>
            </div>
            <h3>Your watchlist is empty</h3>
            <p>Start browsing and save properties you love</p>
            <Link to="/" className="btn-primary">Explore Properties</Link>
          </div>
        )}

        {!loading && properties.length > 0 && (
          <div className="property-grid">
            {properties.map((p) => (
              <WatchlistCard key={p.id} property={p} onRemove={handleRemove} />
            ))}
          </div>
        )}

        {/* Infinite scroll */}
        <div ref={sentinelRef} className="scroll-sentinel">
          {loadingMore && <LoadingSpinner />}
        </div>
      </div>
    </main>
  );
}

/** Thin wrapper that intercepts the remove action to update local state */
function WatchlistCard({ property, onRemove }) {
  const { removeFromWatchlist } = useWatchlist();
  const [removing, setRemoving] = useState(false);

  const handleRemove = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(true);
    try {
      await removeFromWatchlist(property.id);
      onRemove(property.id);
    } catch (_) { setRemoving(false); }
  }, [removeFromWatchlist, property.id, onRemove]);

  return (
    <div className={`watchlist-card-wrap ${removing ? "removing" : ""}`}>
      <PropertyCard property={property} />
      <button className="remove-overlay-btn" onClick={handleRemove} disabled={removing}>
        {removing ? "Removing…" : "✕ Remove"}
      </button>
    </div>
  );
}