// src/components/property/FilterBar.js
import React, { useState, useCallback, memo } from "react";
import { useDebounce } from "../../hooks";

const PROPERTY_TYPES = [
  { value: "",           label: "All Types" },
  { value: "house",      label: "House" },
  { value: "apartment",  label: "Apartment" },
  { value: "townhouse",  label: "Townhouse" },
  { value: "condo",      label: "Condo" },
  { value: "land",       label: "Land" },
  { value: "commercial", label: "Commercial" },
];

const BEDROOM_OPTIONS = [
  { value: "",  label: "Any Beds" },
  { value: "0", label: "Studio" },
  { value: "1", label: "1 Bed" },
  { value: "2", label: "2 Beds" },
  { value: "3", label: "3 Beds" },
  { value: "4", label: "4 Beds" },
  { value: "5", label: "5+ Beds" },
];

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

const PRICE_PRESETS = [
  { label: "Any",          min: "",           max: "" },
  { label: "Under ₱5M",   min: "",           max: "5000000" },
  { label: "₱5M–₱15M",   min: "5000000",    max: "15000000" },
  { label: "₱15M–₱30M",  min: "15000000",   max: "30000000" },
  { label: "Above ₱30M",  min: "30000000",   max: "" },
];

function FilterBar({ onFilterChange, resultCount }) {
  const [searchText,    setSearchText]    = useState("");
  const [propertyType,  setPropertyType]  = useState("");
  const [bedrooms,      setBedrooms]      = useState("");
  const [minPrice,      setMinPrice]      = useState("");
  const [maxPrice,      setMaxPrice]      = useState("");
  const [sort,          setSort]          = useState("newest");
  const [showAdvanced,  setShowAdvanced]  = useState(false);
  const [pricePreset,   setPricePreset]   = useState(0);

  const debouncedText = useDebounce(searchText, 400);

  // Emit filter changes upward (memoized to avoid repeated renders)
  const emitFilters = useCallback((overrides = {}) => {
    const merged = {
      q:             debouncedText,
      property_type: propertyType,
      bedrooms,
      min_price:     minPrice,
      max_price:     maxPrice,
      sort,
      ...overrides,
    };
    // Strip empty values
    const clean = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== "" && v !== null && v !== undefined)
    );
    onFilterChange(clean);
  }, [debouncedText, propertyType, bedrooms, minPrice, maxPrice, sort, onFilterChange]);

  // Re-emit when debounced text changes
  React.useEffect(() => {
    emitFilters({ q: debouncedText });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedText]);

  const handleType = (val) => { setPropertyType(val); emitFilters({ property_type: val }); };
  const handleBeds = (val) => { setBedrooms(val);      emitFilters({ bedrooms: val }); };
  const handleSort = (val) => { setSort(val);           emitFilters({ sort: val }); };

  const applyPricePreset = (idx) => {
    const p = PRICE_PRESETS[idx];
    setPricePreset(idx);
    setMinPrice(p.min);
    setMaxPrice(p.max);
    emitFilters({ min_price: p.min, max_price: p.max });
  };

  const handleCustomPrice = (field, val) => {
    setPricePreset(-1); // Custom
    if (field === "min") { setMinPrice(val); emitFilters({ min_price: val }); }
    else                 { setMaxPrice(val); emitFilters({ max_price: val }); }
  };

  const clearAll = () => {
    setSearchText(""); setPropertyType(""); setBedrooms("");
    setMinPrice("");   setMaxPrice("");     setSort("newest");
    setPricePreset(0);
    onFilterChange({});
  };

  const hasActiveFilters = searchText || propertyType || bedrooms || minPrice || maxPrice;

  return (
    <div className="filter-bar">
      {/* Search row */}
      <div className="filter-search-row">
        <div className="search-input-wrap">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13 13L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by location, title..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {searchText && (
            <button className="clear-search" onClick={() => setSearchText("")}>✕</button>
          )}
        </div>

        <button
          className={`btn-filter-toggle ${showAdvanced ? "active" : ""}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Filters
          {hasActiveFilters && <span className="filter-dot" />}
        </button>
      </div>

      {/* Quick filters always visible */}
      <div className="quick-filters">
        {/* Property type chips */}
        <div className="filter-chips">
          {PROPERTY_TYPES.map(({ value, label }) => (
            <button
              key={value}
              className={`chip ${propertyType === value ? "active" : ""}`}
              onClick={() => handleType(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Bedrooms select */}
        <select
          className="filter-select"
          value={bedrooms}
          onChange={(e) => handleBeds(e.target.value)}
        >
          {BEDROOM_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          className="filter-select"
          value={sort}
          onChange={(e) => handleSort(e.target.value)}
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Advanced filters (collapsible) */}
      {showAdvanced && (
        <div className="advanced-filters">
          <div className="price-section">
            <label className="filter-label">Price Range</label>
            <div className="price-presets">
              {PRICE_PRESETS.map((p, i) => (
                <button
                  key={i}
                  className={`chip ${pricePreset === i ? "active" : ""}`}
                  onClick={() => applyPricePreset(i)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="price-inputs">
              <input
                type="number"
                className="price-input"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => handleCustomPrice("min", e.target.value)}
              />
              <span className="price-dash">–</span>
              <input
                type="number"
                className="price-input"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => handleCustomPrice("max", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Results meta */}
      <div className="filter-meta">
        <span className="result-count">
          {resultCount != null ? `${resultCount.toLocaleString()} properties found` : ""}
        </span>
        {hasActiveFilters && (
          <button className="clear-all-btn" onClick={clearAll}>Clear all</button>
        )}
      </div>
    </div>
  );
}

export default memo(FilterBar);