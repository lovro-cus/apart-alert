import { describe, it, expect, vi, beforeAll } from "vitest";

// Mock Supabase, da testov ne vežemo na pravo bazo.
// Vsaka veriga (.from().insert(), .select().order() ...) vrne resolvane prazne podatke.
vi.mock("@supabase/supabase-js", () => {
  const chain = {
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  };
  return {
    createClient: () => ({
      from: vi.fn(() => chain),
      auth: { admin: {} },
    }),
  };
});

let app;
let request;

beforeAll(async () => {
  request = (await import("supertest")).default;
  app = (await import("../index.js")).default;
});

describe("GET /search", () => {
  it("vrne filtrirane apartmaje po lokaciji", async () => {
    const res = await request(app).get("/search").query({ location: "Maribor" });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);
    expect(res.body.results.every((a) => a.location === "Maribor")).toBe(true);
  });

  it("vrne vse apartmaje brez filtrov", async () => {
    const res = await request(app).get("/search");
    expect(res.status).toBe(200);
    expect(res.body.results.length).toBe(100);
  });
});

describe("GET /apartments/:id", () => {
  it("vrne podrobnosti obstoječega apartmaja", async () => {
    const res = await request(app).get("/apartments/8");
    expect(res.status).toBe(200);
    expect(res.body.apartment.id).toBe(8);
    expect(res.body.apartment.name).toBe("Ljubljana Riverside Loft");
  });

  it("vrne 404 za neobstoječ apartma", async () => {
    const res = await request(app).get("/apartments/9999");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Apartma ne obstaja");
  });
});

describe("requireAdmin middleware", () => {
  it("zavrne dostop brez admin glave (403)", async () => {
    const res = await request(app).get("/admin/overview");
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Dostop zavrnjen");
  });

  it("zavrne napačen admin email (403)", async () => {
    const res = await request(app)
      .get("/admin/overview")
      .set("x-admin-email", "napacen@example.com");
    expect(res.status).toBe(403);
  });
});
