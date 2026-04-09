// src/__tests__/PropertyCard.test.jsx

import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PropertyCard from "../components/property/PropertyCard";
import { AuthContext } from "../context/AuthContext";
import { WatchlistContext } from "../context/WatchlistContext";

const mockProperty = {
  id: 1,
  title: "Beautiful Family Home",
  property_type: "house",
  status: "active",
  price: 12000000,
  bedrooms: 3,
  bathrooms: 2,
  area_sqm: 200,
  city: "Cebu City",
  state: "Cebu",
  primary_image_url: "https://example.com/img.jpg",
  images: [],
  amenities: ["Pool", "Gym"],
  is_featured: false,
  is_watchlisted: false,
};

const mockAuthContext = (user = null) => ({
  user,
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
  error: null,
});

const mockWatchlistContext = (watchlisted = false) => ({
  ids: watchlisted ? new Set([1]) : new Set(),
  properties: [],
  loading: false,
  toggleWatchlist: vi.fn(),
  isWatchlisted: vi.fn(() => watchlisted),
  addToWatchlist: vi.fn(),
  removeFromWatchlist: vi.fn(),
});

function renderCard(authOverrides = {}, watchlistOverrides = {}) {
  const auth      = { ...mockAuthContext(), ...authOverrides };
  const watchlist = { ...mockWatchlistContext(), ...watchlistOverrides };

  return render(
    <MemoryRouter>
      <AuthContext.Provider value={auth}>
        <WatchlistContext.Provider value={watchlist}>
          <PropertyCard property={mockProperty} />
        </WatchlistContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe("PropertyCard", () => {
  it("renders property title and price", () => {
    renderCard();
    expect(screen.getByText("Beautiful Family Home")).toBeInTheDocument();
    expect(screen.getByText("₱12M")).toBeInTheDocument();
  });

  it("renders property specs", () => {
    renderCard();
    expect(screen.getByText("3 Beds")).toBeInTheDocument();
    expect(screen.getByText("2 Bath")).toBeInTheDocument();
    expect(screen.getByText("200 m²")).toBeInTheDocument();
  });

  it("renders location", () => {
    renderCard();
    expect(screen.getByText(/Cebu City/)).toBeInTheDocument();
  });

  it("does not show watchlist button when user is not logged in", () => {
    renderCard({ user: null });
    expect(screen.queryByLabelText(/watchlist/i)).not.toBeInTheDocument();
  });

  it("shows watchlist button when user is logged in", () => {
    renderCard({ user: { id: 1, first_name: "Alex" } });
    expect(screen.getByLabelText(/watchlist/i)).toBeInTheDocument();
  });

  it("calls toggleWatchlist when watchlist button is clicked", async () => {
    const toggleWatchlist = vi.fn().mockResolvedValue(undefined);
    renderCard(
      { user: { id: 1, first_name: "Alex" } },
      { toggleWatchlist, isWatchlisted: () => false }
    );
    fireEvent.click(screen.getByLabelText(/add to watchlist/i));
    await waitFor(() => expect(toggleWatchlist).toHaveBeenCalledWith(mockProperty));
  });

  it("shows correct watchlist button state when watchlisted", () => {
    renderCard(
      { user: { id: 1, first_name: "Alex" } },
      { isWatchlisted: () => true }
    );
    expect(screen.getByLabelText(/remove from watchlist/i)).toBeInTheDocument();
  });

  it("renders house type badge", () => {
    renderCard();
    expect(screen.getByText("House")).toBeInTheDocument();
  });
});
