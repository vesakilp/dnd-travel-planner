import { describe, it, expect } from "vitest";
import { calculateRations, totalRationsForStage } from "../rations";
import { Character } from "../types";

const characters: Character[] = [
  { id: "1", name: "Aria", species: "Elf", characterClass: "Ranger", level: 5 },
  { id: "2", name: "Bram", species: "Human", characterClass: "Fighter", level: 3 },
];

describe("calculateRations", () => {
  it("gives 1 ration per character per full day", () => {
    const result = calculateRations(characters, 2);
    expect(result[0].rations).toBe(2);
    expect(result[1].rations).toBe(2);
  });
  it("rounds partial days up", () => {
    const result = calculateRations(characters, 1.5);
    expect(result[0].rations).toBe(2);
  });
  it("handles 0 days → 0 rations", () => {
    const result = calculateRations(characters, 0);
    expect(result[0].rations).toBe(0);
  });
});

describe("totalRationsForStage", () => {
  it("sums all character rations", () => {
    const rations = calculateRations(characters, 3);
    expect(totalRationsForStage(rations)).toBe(6);
  });
});
