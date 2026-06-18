import { describe, it, expect } from "vitest";
import { filterApartments, sortApartments } from "../lib/apartments.js";

const sample = [
  { id: 1, name: "A", location: "Maribor", price: 75, rating: 4.6, distance: 250 },
  { id: 2, name: "B", location: "Ljubljana", price: 120, rating: 4.5, distance: 900 },
  { id: 3, name: "C", location: "Maribor", price: 55, rating: 3.9, distance: 400 },
  { id: 4, name: "D", location: "Piran", price: 210, rating: 5.0, distance: 80 },
];

describe("filterApartments", () => {
  it("vrne vse, kadar ni filtrov", () => {
    expect(filterApartments(sample)).toHaveLength(4);
  });

  it("filtrira po lokaciji (case-insensitive)", () => {
    const res = filterApartments(sample, { location: "maribor" });
    expect(res).toHaveLength(2);
    expect(res.every((a) => a.location === "Maribor")).toBe(true);
  });

  it("filtrira po delnem ujemanju lokacije", () => {
    const res = filterApartments(sample, { location: "lju" });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe(2);
  });

  it("filtrira po minimalni ceni", () => {
    const res = filterApartments(sample, { minPrice: 100 });
    expect(res.map((a) => a.id)).toEqual([2, 4]);
  });

  it("filtrira po maksimalni ceni", () => {
    const res = filterApartments(sample, { maxPrice: 75 });
    expect(res.map((a) => a.id)).toEqual([1, 3]);
  });

  it("kombinira lokacijo in cenovni razpon", () => {
    const res = filterApartments(sample, { location: "Maribor", minPrice: 60, maxPrice: 100 });
    expect(res.map((a) => a.id)).toEqual([1]);
  });

  it("sprejme cene kot nize (iz query parametrov)", () => {
    const res = filterApartments(sample, { minPrice: "100", maxPrice: "150" });
    expect(res.map((a) => a.id)).toEqual([2]);
  });

  it("vrne prazen seznam, kadar ni ujemanj", () => {
    expect(filterApartments(sample, { location: "Bled" })).toEqual([]);
  });
});

describe("sortApartments", () => {
  it("sortira naraščajoče po ceni", () => {
    const res = sortApartments(sample, "price", "asc");
    expect(res.map((a) => a.price)).toEqual([55, 75, 120, 210]);
  });

  it("sortira padajoče po oceni", () => {
    const res = sortApartments(sample, "rating", "desc");
    expect(res[0].rating).toBe(5.0);
  });

  it("ne mutira originalnega seznama", () => {
    const copy = [...sample];
    sortApartments(sample, "price", "asc");
    expect(sample).toEqual(copy);
  });
});
