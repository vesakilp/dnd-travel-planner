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

  it("uses only the first stage departure time and auto-chains later stage starts", async () => {
    const stage1 = createStage(1, 12);
    const stage2 = { ...createStage(2, 12), startTimeOfDay: "night" as const };
    const result = await generateJourney(
      {
        characters: [baseCharacter],
        stages: [stage1, stage2],
      },
      "calculate",
      123
    );

    expect(result.stages[0].startDayNumber).toBe(1);
    expect(result.stages[0].startTimeLabel).toBe("Morning");
    expect(result.stages[0].endDayNumber).toBe(1);
    expect(result.stages[0].endTimeLabel).toBe("Afternoon");

    expect(result.stages[1].startDayNumber).toBe(1);
    expect(result.stages[1].startTimeLabel).toBe("Afternoon");
    expect(result.stages[1].endDayNumber).toBe(1);
    expect(result.stages[1].endTimeLabel).toBe("Evening");
  });

  it("moves next stage start to next morning after evening arrival", async () => {
    const stage1 = { ...createStage(1, 24), startTimeOfDay: "evening" as const };
    const stage2 = createStage(2, 12);
    const result = await generateJourney(
      {
        characters: [baseCharacter],
        stages: [stage1, stage2],
      },
      "calculate",
      123
    );

    expect(result.stages[0].startDayNumber).toBe(2);
    expect(result.stages[0].startTimeLabel).toBe("Morning");
    expect(result.stages[0].endDayNumber).toBe(2);
    expect(result.stages[0].endTimeLabel).toBe("Evening");

    expect(result.stages[1].startDayNumber).toBe(3);
    expect(result.stages[1].startTimeLabel).toBe("Morning");
  });
});
