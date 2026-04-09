
// src/__tests__/format.test.jsx
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import { formatPrice, bedroomsLabel, propertyTypeLabel } from "../utils/format";

describe("formatPrice", () => {
  it("formats millions", () => { expect(formatPrice(5000000)).toBe("₱5M"); });
  it("formats decimals", () => { expect(formatPrice(5500000)).toBe("₱5.5M"); });
  it("formats thousands", () => { expect(formatPrice(500000)).toBe("₱500K"); });
  it("handles null",     () => { expect(formatPrice(null)).toBe("—"); });
});

describe("bedroomsLabel", () => {
  it("returns Studio for 0", () => { expect(bedroomsLabel(0)).toBe("Studio"); });
  it("returns 1 Bed for 1",  () => { expect(bedroomsLabel(1)).toBe("1 Bed"); });
  it("returns plural for 3", () => { expect(bedroomsLabel(3)).toBe("3 Beds"); });
});

describe("propertyTypeLabel", () => {
  it("capitalizes house",     () => { expect(propertyTypeLabel("house")).toBe("House"); });
  it("capitalizes apartment", () => { expect(propertyTypeLabel("apartment")).toBe("Apartment"); });
  it("returns unknown types", () => { expect(propertyTypeLabel("villa")).toBe("villa"); });
});