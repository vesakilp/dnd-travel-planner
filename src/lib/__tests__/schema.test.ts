import { describe, expect, it } from "vitest";
import { PlannerFormSchema } from "@/lib/schema";

const baseCharacter = {
  id: "hero-1",
  name: "Aria",
  species: "Elf",
  characterClass: "Ranger",
  level: 5,
};

const createStage = (stageNumber: number) => ({
  stageNumber,
  startLocation: `Start ${stageNumber}`,
  startTimeOfDay: "morning" as const,
  endLocation: `End ${stageNumber}`,
  distanceMiles: 24,
  season: "summer" as const,
  terrain: "grassland" as const,
  pace: "normal" as const,
  vehicle: "none" as const,
  notes: "",
});

describe("PlannerFormSchema", () => {
  it("accepts a single journey stage", () => {
    const result = PlannerFormSchema.safeParse({
      characters: [baseCharacter],
      stages: [createStage(1)],
    });

    expect(result.success).toBe(true);
  });

  it("accepts more than three journey stages", () => {
    const result = PlannerFormSchema.safeParse({
      characters: [baseCharacter],
      stages: [createStage(1), createStage(2), createStage(3), createStage(4)],
    });

    expect(result.success).toBe(true);
  });
});
