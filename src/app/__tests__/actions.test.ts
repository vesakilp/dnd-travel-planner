import { describe, expect, it } from "vitest";
import { generateJourney, suggestForgottenRealmsDistance } from "@/app/actions";

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

  it("generates encounter checks for each day spanned by a multi-day stage", async () => {
    const result = await generateJourney(
      {
        characters: [baseCharacter],
        stages: [createStage(1, 60)],
      },
      "challenges",
      123
    );

    const stage = result.stages[0];
    expect(stage.startDayNumber).toBe(1);
    expect(stage.endDayNumber).toBe(3);
    expect(stage.encounter?.dailyRolls).toHaveLength(3);
  });

  it("includes day-by-day narrative entries for multi-day stages", async () => {
    const originalApiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const result = await generateJourney(
        {
          characters: [baseCharacter],
          stages: [createStage(1, 60)],
        },
        "all",
        123
      );

      const narrative = result.stages[0].narrative ?? "";
      expect(narrative).toContain("Day 1:");
      expect(narrative).toContain("Day 2:");
      expect(narrative).toContain("Day 3:");
    } finally {
      if (originalApiKey === undefined) {
        delete process.env.OPENAI_API_KEY;
      } else {
        process.env.OPENAI_API_KEY = originalApiKey;
      }
    }
  });
});

describe("suggestForgottenRealmsDistance", () => {
  it("returns a non-throwing fallback when OPENAI_API_KEY is missing", async () => {
    const originalApiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const result = await suggestForgottenRealmsDistance("Neverwinter", "Waterdeep");
      expect(result.distanceMiles).toBeNull();
      expect(result.message).toContain("unavailable");
    } finally {
      if (originalApiKey === undefined) {
        delete process.env.OPENAI_API_KEY;
      } else {
        process.env.OPENAI_API_KEY = originalApiKey;
      }
    }
  });
});
