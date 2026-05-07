import { describe, it, expect } from "vitest";
import { generateEncounters } from "../encounters";
import { createRng } from "../dice";

describe("generateEncounters", () => {
  it("returns day and night rolls", () => {
    const rng = createRng(42);
    const result = generateEncounters(rng);
    expect(result.dayRoll).toBeDefined();
    expect(result.nightRoll).toBeDefined();
    expect(result.dayRoll.roll).toBeGreaterThanOrEqual(1);
    expect(result.dayRoll.roll).toBeLessThanOrEqual(20);
  });

  it("is reproducible with the same seed", () => {
    const r1 = generateEncounters(createRng(123));
    const r2 = generateEncounters(createRng(123));
    expect(r1.dayRoll.roll).toBe(r2.dayRoll.roll);
    expect(r1.nightRoll.roll).toBe(r2.nightRoll.roll);
  });

  it("triggered encounters have monster data", () => {
    // Find a seed that triggers an encounter
    for (let seed = 0; seed < 100; seed++) {
      const rng = createRng(seed);
      const result = generateEncounters(rng);
      if (result.dayRoll.triggered) {
        expect(result.dayRoll.monsterName).toBeTruthy();
        expect(result.dayRoll.monsterCount).toBeTruthy();
        return;
      }
    }
  });
});
