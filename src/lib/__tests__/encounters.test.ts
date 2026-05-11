import { describe, it, expect } from "vitest";
import { generateEncounters } from "../encounters";
import { createRng } from "../dice";

describe("generateEncounters", () => {
  it("returns day and night rolls", () => {
    const rng = createRng(42);
    const result = generateEncounters(1, rng);
    expect(result.dayRoll).toBeDefined();
    expect(result.nightRoll).toBeDefined();
    expect(result.dailyRolls).toHaveLength(1);
    expect(result.dayRoll.roll).toBeGreaterThanOrEqual(1);
    expect(result.dayRoll.roll).toBeLessThanOrEqual(20);
  });

  it("is reproducible with the same seed", () => {
    const r1 = generateEncounters(3, createRng(123));
    const r2 = generateEncounters(3, createRng(123));
    expect(r1.dailyRolls.map((r) => r.dayRoll.roll)).toEqual(r2.dailyRolls.map((r) => r.dayRoll.roll));
    expect(r1.dailyRolls.map((r) => r.nightRoll.roll)).toEqual(r2.dailyRolls.map((r) => r.nightRoll.roll));
  });

  it("generates a day and night check for each journey day", () => {
    const result = generateEncounters(4, createRng(99));
    expect(result.dailyRolls).toHaveLength(4);
    expect(result.dailyRolls[0].dayNumber).toBe(1);
    expect(result.dailyRolls[3].dayNumber).toBe(4);
  });

  it("triggered encounters have monster data", () => {
    // Find a seed that triggers an encounter — with ~36% chance per seed, 100 tries is sufficient
    let found = false;
    for (let seed = 0; seed < 100; seed++) {
      const rng = createRng(seed);
      const result = generateEncounters(1, rng);
      if (result.dayRoll.triggered) {
        expect(result.dayRoll.monsterName).toBeTruthy();
        expect(result.dayRoll.monsterCount).toBeTruthy();
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });
});
