import { describe, it, expect } from "vitest";
import { validatePasswordChange } from "./validation";

describe("validatePasswordChange", () => {
  it("sprejme ujemajoči se gesli", () => {
    expect(validatePasswordChange("geslo123", "geslo123")).toEqual({
      ok: true,
      error: null,
    });
  });

  it("zavrne neujemajoči se gesli", () => {
    const res = validatePasswordChange("geslo123", "drugo");
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/ne ujemata/);
  });

  it("zavrne prazno geslo", () => {
    expect(validatePasswordChange("", "").ok).toBe(false);
  });
});
