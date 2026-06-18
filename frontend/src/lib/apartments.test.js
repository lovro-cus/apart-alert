import { describe, it, expect } from "vitest";
import { sortApartments, isAdminEmail } from "./apartments";

const sample = [
  { id: 1, price: 120, rating: 4.5, distance: 900 },
  { id: 2, price: 55, rating: 3.9, distance: 400 },
  { id: 3, price: 210, rating: 5.0, distance: 80 },
];

describe("sortApartments", () => {
  it("sortira naraščajoče po ceni", () => {
    expect(sortApartments(sample, "price", "asc").map((a) => a.price)).toEqual([
      55, 120, 210,
    ]);
  });

  it("sortira padajoče po ceni", () => {
    expect(sortApartments(sample, "price", "desc").map((a) => a.price)).toEqual([
      210, 120, 55,
    ]);
  });

  it("sortira po razdalji naraščajoče", () => {
    expect(sortApartments(sample, "distance", "asc")[0].id).toBe(3);
  });

  it("ne mutira originalnega seznama", () => {
    const copy = [...sample];
    sortApartments(sample, "price", "asc");
    expect(sample).toEqual(copy);
  });
});

describe("isAdminEmail", () => {
  it("prepozna admin email", () => {
    expect(isAdminEmail("culjo41@gmail.com")).toBe(true);
  });

  it("zavrne navaden email", () => {
    expect(isAdminEmail("uporabnik@example.com")).toBe(false);
  });
});
