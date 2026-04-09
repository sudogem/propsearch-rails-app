// src/__tests__/FilterBar.test.jsx
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import FilterBar from "../components/property/FilterBar";

describe("FilterBar", () => {
  it("renders search input", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter><FilterBar onFilterChange={vi.fn()} resultCount={10} /></MemoryRouter>
    );
    expect(getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("renders property type chips", () => {
    const { getByText } = render(
      <MemoryRouter><FilterBar onFilterChange={vi.fn()} /></MemoryRouter>
    );
    expect(getByText("House")).toBeInTheDocument();
    expect(getByText("Apartment")).toBeInTheDocument();
    expect(getByText("Condo")).toBeInTheDocument();
  });

  it("calls onFilterChange when property type is selected", () => {
    const onFilterChange = vi.fn();
    const { getByText } = render(
      <MemoryRouter><FilterBar onFilterChange={onFilterChange} /></MemoryRouter>
    );
    fireEvent.click(getByText("Apartment"));
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ property_type: "apartment" })
    );
  });

  it("shows result count", () => {
    const { getByText } = render(
      <MemoryRouter><FilterBar onFilterChange={vi.fn()} resultCount={42} /></MemoryRouter>
    );
    expect(getByText(/42 properties found/i)).toBeInTheDocument();
  });

  it("shows clear all button when filters are active", () => {
    const { getByText } = render(
      <MemoryRouter><FilterBar onFilterChange={vi.fn()} resultCount={5} /></MemoryRouter>
    );
    fireEvent.click(getByText("Condo"));
    expect(getByText(/clear all/i)).toBeInTheDocument();
  });
});
