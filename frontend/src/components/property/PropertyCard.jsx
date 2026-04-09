// src/components/property/PropertyCard.js
import React, { memo, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWatchlist } from "../../context/WatchlistContext";
import { formatPrice, bedroomsLabel, propertyTypeLabel } from "../../utils/format";

function PropertyCard({ property, showRemove = false }) {
  const { user }                    = useAuth();
  const { isWatchlisted, toggleWatchlist } = useWatchlist();
  const [toggling, setToggling]     = useState(false);
  const [imgError, setImgError]     = useState(false);

  const watchlisted = isWatchlisted(property.id);

  const handleWatchlist = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    setToggling(true);
    try {
      await toggleWatchlist(property);
    } catch (_) {}
    finally { setToggling(false); }
  }, [user, toggleWatchlist, property]);

  const fallbackImg = `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&auto=format`;

  return (
    <article className="property-card">
      <Link to={`/properties/${property.id}`} className="card-link">
        {/* Image */}
        <div className="card-image-wrap">
          <img
            src={imgError ? fallbackImg : (property.primary_image_url || fallbackImg)}
            alt={property.title}
            className="card-image"
            loading="lazy"
            onError={() => setImgError(true)}
          />
          {/* Badges */}
          <div className="card-badges">
            <span className="badge-type">{propertyTypeLabel(property.property_type)}</span>
            {property.is_featured && <span className="badge-featured">Featured</span>}
          </div>

          {/* Watchlist heart button */}
          {user && (
            <button
              className={`watchlist-btn ${watchlisted ? "active" : ""} ${toggling ? "toggling" : ""}`}
              onClick={handleWatchlist}
              aria-label={watchlisted ? "Remove from watchlist" : "Add to watchlist"}
              title={watchlisted ? "Remove from watchlist" : "Save to watchlist"}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill={watchlisted ? "currentColor" : "none"}>
                <path
                  d="M10 17.5s-7.5-5-7.5-10a5 5 0 0 1 7.5-4.33A5 5 0 0 1 17.5 7.5c0 5-7.5 10-7.5 10z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="card-content">
          <div className="card-price">{formatPrice(property.price)}</div>
          <h3 className="card-title">{property.title}</h3>
          <p className="card-address">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1a3.5 3.5 0 0 1 3.5 3.5C9.5 7.5 6 11 6 11S2.5 7.5 2.5 4.5A3.5 3.5 0 0 1 6 1z" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="6" cy="4.5" r="1" fill="currentColor"/>
            </svg>
            {property.city}{property.state ? `, ${property.state}` : ""}
          </p>

          <div className="card-specs">
            <span className="spec">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="5" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4 5V3a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              {bedroomsLabel(property.bedrooms)}
            </span>
            <span className="spec-divider" />
            <span className="spec">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 8h10M2 8V5a2 2 0 0 1 4 0v3M12 8v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              {property.bathrooms} Bath
            </span>
            {property.area_sqm && (
              <>
                <span className="spec-divider" />
                <span className="spec">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1.5" y="1.5" width="11" height="11" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M1.5 6.5h11M6.5 1.5v11" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                  {property.area_sqm} m²
                </span>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Remove button for watchlist page */}
      {showRemove && (
        <button className="remove-btn" onClick={handleWatchlist} disabled={toggling}>
          {toggling ? "Removing…" : "Remove"}
        </button>
      )}
    </article>
  );
}

export default memo(PropertyCard);