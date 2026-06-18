import { describe, it, expect } from "vitest";
import { countEvents, topLocations, topFavorites } from "../lib/metrics.js";

describe("countEvents", () => {
  it("prešteje prijave, registracije in iskanja po tipu", () => {
    const metrics = [
      { event_type: "login" },
      { event_type: "login" },
      { event_type: "register" },
      { event_type: "search", event_data: { location: "Bled" } },
      { event_type: "login_failed" },
    ];
    const { logins, registers, searches } = countEvents(metrics);
    expect(logins).toBe(2);
    expect(registers).toBe(1);
    expect(searches).toHaveLength(1);
  });

  it("vrne ničle za prazen vhod", () => {
    const { logins, registers, searches } = countEvents([]);
    expect(logins).toBe(0);
    expect(registers).toBe(0);
    expect(searches).toEqual([]);
  });
});

describe("topLocations", () => {
  it("razvrsti lokacije po številu iskanj padajoče", () => {
    const searches = [
      { event_data: { location: "Bled" } },
      { event_data: { location: "Bled" } },
      { event_data: { location: "Piran" } },
    ];
    expect(topLocations(searches)).toEqual([
      ["bled", 2],
      ["piran", 1],
    ]);
  });

  it("ignorira iskanja brez lokacije in upošteva limit", () => {
    const searches = [
      { event_data: {} },
      { event_data: { location: "A" } },
      { event_data: { location: "B" } },
      { event_data: { location: "C" } },
    ];
    expect(topLocations(searches, 2)).toHaveLength(2);
  });
});

describe("topFavorites", () => {
  it("prešteje in razvrsti apartmaje po priljubljenosti", () => {
    const favorites = [
      { apartment_id: 5 },
      { apartment_id: 5 },
      { apartment_id: 3 },
    ];
    const res = topFavorites(favorites);
    expect(res[0]).toEqual({ apartmentId: 5, count: 2 });
    expect(res[1]).toEqual({ apartmentId: 3, count: 1 });
  });

  it("pretvori apartmentId v število", () => {
    const res = topFavorites([{ apartment_id: "7" }]);
    expect(res[0].apartmentId).toBe(7);
    expect(typeof res[0].apartmentId).toBe("number");
  });
});
