import { describe, it, expect } from "vitest";
import { getTerrainMultiplier, TERRAIN_CONFIG } from "../terrain";

describe("getTerrainMultiplier", () => {
  it("returns 0.5 for mountain", () => {
    expect(getTerrainMultiplier("mountain")).toBe(0.5);
  });
  it("returns 0.5 for swamp", () => {
    expect(getTerrainMultiplier("swamp")).toBe(0.5);
  });
  it("returns 1.0 for grassland", () => {
    expect(getTerrainMultiplier("grassland")).toBe(1.0);
  });
  it("all terrain types defined", () => {
    const terrains = Object.keys(TERRAIN_CONFIG);
    expect(terrains.length).toBeGreaterThan(0);
    terrains.forEach((t) => {
      expect(TERRAIN_CONFIG[t as keyof typeof TERRAIN_CONFIG].multiplier).toBeGreaterThan(0);
    });
  });
});
