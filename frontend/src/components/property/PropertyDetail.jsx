// src/components/property/PropertyDetail.js
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { propertyService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useWatchlist } from "../../context/WatchlistContext";
import { formatPriceFull, formatArea, propertyTypeLabel, bedroomsLabel } from "../../utils/format";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function PropertyDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const { isWatchlisted, toggleWatchlist } = useWatchlist();

  const [property,  setProperty]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [toggling,  setToggling]  = useState(false);

  useEffect(() => {
    setLoading(true);
    propertyService.get(id)
      .then((d) => { setProperty(d.data); setLoading(false); })
      .catch(() => { setError("Property not found"); setLoading(false); });
  }, [id]);

  const handleWatchlist = useCallback(async () => {
    if (!user) { navigate("/auth"); return; }
    setToggling(true);
    try { await toggleWatchlist(property); }
    catch (_) {}
    finally { setToggling(false); }
  }, [user, navigate, toggleWatchlist, property]);

  if (loading) return <LoadingSpinner fullPage />;
  if (error)   return (
    <div className="error-page">
      <h2>{error}</h2>
      <button className="btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  const images = property.images?.length ? property.images : [property.primary_image_url].filter(Boolean);
  const watchlisted = isWatchlisted(property.id);

  return (
    <main className="detail-page">
      <div className="detail-container">
        {/* Back button */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Back to results
        </button>

        {/* Gallery */}
        <div className="detail-gallery">
          <div className="gallery-main">
            <img
              src={images[activeImg] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900"}
              alt={property.title}
              className="gallery-main-img"
            />
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`gallery-thumb ${activeImg === i ? "active" : ""}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`View ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Two column layout */}
        <div className="detail-body">
          <div className="detail-main">
            {/* Title & badges */}
            <div className="detail-header">
              <div className="detail-badges">
                <span className="badge-type">{propertyTypeLabel(property.property_type)}</span>
                {property.is_featured && <span className="badge-featured">Featured</span>}
                <span className={`badge-status status-${property.status}`}>{property.status}</span>
              </div>
              <h1 className="detail-title">{property.title}</h1>
              <p className="detail-address">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1a4 4 0 0 1 4 4c0 3.5-4 8-4 8S3 8.5 3 5a4 4 0 0 1 4-4z" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="7" cy="5" r="1.2" fill="currentColor"/>
                </svg>
                {property.address}, {property.city}{property.state ? `, ${property.state}` : ""}
              </p>
            </div>

            {/* Key specs */}
            <div className="detail-specs">
              <div className="spec-card">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="2" y="8" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M7 8V5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <div>
                  <div className="spec-value">{bedroomsLabel(property.bedrooms)}</div>
                  <div className="spec-label">Bedrooms</div>
                </div>
              </div>
              <div className="spec-card">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M3 12h16M3 12V8a3 3 0 0 1 6 0v4M19 12v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-3" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <div>
                  <div className="spec-value">{property.bathrooms}</div>
                  <div className="spec-label">Bathrooms</div>
                </div>
              </div>
              {property.area_sqm && (
                <div className="spec-card">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="2.5" y="2.5" width="17" height="17" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M2.5 11h17M11 2.5v17" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  <div>
                    <div className="spec-value">{formatArea(property.area_sqm)}</div>
                    <div className="spec-label">Floor Area</div>
                  </div>
                </div>
              )}
              {property.parking_spaces > 0 && (
                <div className="spec-card">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="2" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M6 18v2M16 18v2M2 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <div className="spec-value">{property.parking_spaces}</div>
                    <div className="spec-label">Parking</div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <div className="detail-description">
                <h2 className="detail-section-title">About this property</h2>
                <p>{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="detail-amenities">
                <h2 className="detail-section-title">Amenities</h2>
                <div className="amenities-grid">
                  {property.amenities.map((a) => (
                    <span key={a} className="amenity-tag">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky sidebar */}
          <aside className="detail-sidebar">
            <div className="price-card">
              <div className="price-card-price">{formatPriceFull(property.price)}</div>
              <div className="price-card-meta">
                {property.area_sqm && (
                  <span>₱{Math.round(property.price / property.area_sqm).toLocaleString()} / m²</span>
                )}
              </div>
              <button
                className={`watchlist-cta ${watchlisted ? "watchlisted" : ""}`}
                onClick={handleWatchlist}
                disabled={toggling}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill={watchlisted ? "currentColor" : "none"}>
                  <path d="M9 15.5S2 11 2 6.5a5 5 0 0 1 7-4.55A5 5 0 0 1 16 6.5C16 11 9 15.5 9 15.5z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                {toggling ? "Updating…" : watchlisted ? "Saved to Watchlist" : "Save to Watchlist"}
              </button>

              {!user && (
                <p className="signin-prompt">
                  <a href="/auth">Sign in</a> to save this property
                </p>
              )}

              <div className="contact-divider">Interested in this property?</div>
              <button className="btn-contact">Contact Agent</button>
            </div>

            {property.watcher_count > 1 && (
              <p className="watcher-count">
                🔥 {property.watcher_count} people have saved this
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}