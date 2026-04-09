// src/components/property/SearchPage.js
import React, { useState, useCallback, useEffect } from "react";
import FilterBar from "./FilterBar";
import PropertyCard from "./PropertyCard";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useProperties, useIntersectionObserver } from "../../hooks";
import { propertyService } from "../../services/api";

export default function SearchPage() {
  const [filters,    setFilters]    = useState({});
  const [featured,   setFeatured]   = useState([]);
  const [showHero,   setShowHero]   = useState(true);

  const { properties, meta, loading, loadingMore, error, loadMore, hasMore } =
    useProperties(filters);

  // Load featured on mount
  useEffect(() => {
    propertyService.featured().then((d) => setFeatured(d.data || [])).catch(() => {});
  }, []);

  // Hide hero once user starts filtering
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    if (Object.keys(newFilters).length > 0) setShowHero(false);
    else setShowHero(true);
  }, []);

  // Infinite scroll sentinel
  const sentinelRef = useIntersectionObserver(
    useCallback(() => { if (hasMore && !loadingMore) loadMore(); }, [hasMore, loadingMore, loadMore])
  );

  return (
    <main className="search-page">
      {/* Hero section */}
      {showHero && (
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">Find Your Perfect Home</h1>
            <p className="hero-subtitle">Browse thousands of properties across the Philippines</p>
          </div>
          <div className="hero-bg" />
        </section>
      )}

      <div className="page-container">
        <FilterBar onFilterChange={handleFilterChange} resultCount={meta?.total_count} />

        {/* Featured properties (shown on initial load) */}
        {showHero && featured.length > 0 && (
          <section className="featured-section">
            <h2 className="section-title">
              <span className="title-accent">Featured</span> Properties
            </h2>
            <div className="property-grid">
              {featured.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          </section>
        )}

        {/* Main results */}
        <section className="results-section">
          {!showHero && (
            <h2 className="section-title">
              {meta?.total_count
                ? <><span className="title-accent">{meta.total_count}</span> Properties Found</>
                : "Properties"
              }
            </h2>
          )}

          {/* Error state */}
          {error && (
            <div className="error-state">
              <p>⚠️ {error}</p>
              <button className="btn-secondary" onClick={() => setFilters({ ...filters })}>
                Retry
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="property-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="card-skeleton">
                  <div className="skeleton-img" />
                  <div className="skeleton-content">
                    <div className="skeleton-line wide" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line narrow" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results grid */}
          {!loading && properties.length > 0 && (
            <div className="property-grid">
              {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && properties.length === 0 && Object.keys(filters).length > 0 && (
            <div className="empty-state">
              <div className="empty-icon">🏘️</div>
              <h3>No properties found</h3>
              <p>Try adjusting your search filters</p>
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="scroll-sentinel">
            {loadingMore && <LoadingSpinner />}
            {!hasMore && !loading && properties.length > 0 && (
              <p className="end-message">You've seen all {meta?.total_count} properties</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}