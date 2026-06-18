import { describe, it, expect } from "vitest";
import { findMatches, analyticsPerLocation } from "../lib/alerts.js";

const apartments = [
  { id: 1, location: "Maribor", price: 75 },
  { id: 2, location: "Maribor", price: 150 },
  { id: 3, location: "Piran", price: 120 },
];

describe("findMatches", () => {
  it("najde apartmaje znotraj lokacije in cenovnega razpona", () => {
    const res = findMatches(apartments, { location: "Maribor", min_price: 50, max_price: 100 });
    expect(res.map((a) => a.id)).toEqual([1]);
  });

  it("vrne prazno, kadar ni ujemanj v razponu", () => {
    const res = findMatches(apartments, { location: "Piran", min_price: 0, max_price: 50 });
    expect(res).toEqual([]);
  });

  it("upošteva meje cenovnega razpona (vključujoče)", () => {
    const res = findMatches(apartments, { location: "Maribor", min_price: 75, max_price: 150 });
    expect(res.map((a) => a.id)).toEqual([1, 2]);
  });
});

describe("analyticsPerLocation", () => {
  it("prešteje alerte po lokaciji", () => {
    const alerts = [
      { location: "Bled" },
      { location: "Bled" },
      { location: "Piran" },
    ];
    expect(analyticsPerLocation(alerts)).toEqual({ Bled: 2, Piran: 1 });
  });

  it("vrne prazen objekt za prazen vhod", () => {
    expect(analyticsPerLocation([])).toEqual({});
  });
});
