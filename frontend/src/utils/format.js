// src/utils/format.js

export const formatPrice = (price) => {
  if (!price && price !== 0) return "—";
  if (price >= 1_000_000) {
    return `₱${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (price >= 1_000) {
    return `₱${(price / 1_000).toFixed(0)}K`;
  }
  return `₱${price.toLocaleString()}`;
};

export const formatPriceFull = (price) =>
  `₱${Number(price).toLocaleString("en-PH")}`;

export const formatArea = (sqm) =>
  sqm ? `${sqm.toLocaleString()} m²` : null;

export const propertyTypeLabel = (type) => {
  const labels = {
    house:      "House",
    apartment:  "Apartment",
    townhouse:  "Townhouse",
    condo:      "Condo",
    land:       "Land",
    commercial: "Commercial",
  };
  return labels[type] || type;
};

export const bedroomsLabel = (n) => {
  if (n === 0) return "Studio";
  if (n === 1) return "1 Bed";
  return `${n} Beds`;
};

export const statusColor = (status) => {
  const colors = {
    active: "#22c55e",
    sold:   "#ef4444",
    rented: "#f59e0b",
  };
  return colors[status] || "#6b7280";
};