import { describe, expect, it } from "vitest";
import { generateJourney } from "@/app/actions";

const baseCharacter = {
  id: "hero-1",
  name: "Aria",
  species: "Elf",
  characterClass: "Ranger",
  level: 5,
};

const createStage = (stageNumber: number, distanceMiles: number) => ({
  stageNumber,
  startLocation: `Start ${stageNumber}`,
  startTimeOfDay: "morning" as const,
  endLocation: `End ${stageNumber}`,
  distanceMiles,
  season: "summer" as const,
  terrain: "grassland" as const,
  pace: "normal" as const,
  vehicle: "none" as const,
  notes: "",
});

describe("generateJourney", () => {
  it("renumbers stages from their current order", async () => {
    const result = await generateJourney(
      {
        characters: [baseCharacter],
        stages: [createStage(2, 24), createStage(5, 48)],
      },
      "calculate",
      123
    );

    expect(result.stages.map((stage) => stage.stageNumber)).toEqual([1, 2]);
    expect(result.stages.map((stage) => stage.totalRations)).toEqual([1, 2]);
  });
});
