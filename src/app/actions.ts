"use server";

import { PlannerFormData, StageResult, JourneyResult } from "@/lib/types";
import { getEffectiveMilesPerDay, formatDuration, PACE_CONFIG } from "@/lib/pace";
import { getTerrainMultiplier } from "@/lib/terrain";
import { calculateRations, totalRationsForStage } from "@/lib/rations";
import { generateEncounters } from "@/lib/encounters";
import { generateNarrative } from "@/lib/narrative";
import { createRng } from "@/lib/dice";

export type GenerateMode = "calculate" | "narrative" | "challenges" | "all";

export async function generateJourney(
  data: PlannerFormData,
  mode: GenerateMode,
  seed?: number
): Promise<JourneyResult> {
  const rng = createRng(seed ?? Date.now());

  const stages: StageResult[] = data.stages.map((stage, index) => {
    const stageNumber = index + 1;
    const normalizedStage = { ...stage, stageNumber };
    const terrainMultiplier = getTerrainMultiplier(stage.terrain);
    const { effectiveMilesPerDay, warning } = getEffectiveMilesPerDay(
      stage.pace,
      terrainMultiplier,
      stage.vehicle,
      stage.vehicleSpeedOverride
    );
    const daysRequired = stage.distanceMiles / effectiveMilesPerDay;
    const humanReadableDuration = formatDuration(daysRequired);
    const paceReminder = PACE_CONFIG[stage.pace].reminder;
    const characterRations = calculateRations(data.characters, daysRequired);
    const totalRations = totalRationsForStage(characterRations);

    let encounter: import("@/lib/types").EncounterResult | undefined;
    let narrative: string | undefined;

    if (mode === "challenges" || mode === "all") {
      encounter = generateEncounters(rng);
    }

    if (mode === "narrative" || mode === "all") {
      narrative = generateNarrative(normalizedStage, data.characters, encounter);
    }

    return {
      stageNumber,
      effectiveMilesPerDay,
      daysRequired,
      humanReadableDuration,
      paceReminder,
      vehicleWarning: warning,
      characterRations,
      totalRations,
      encounter,
      narrative,
    };
  });

  const grandTotalRations = stages.reduce((sum, s) => sum + s.totalRations, 0);

  return { stages, grandTotalRations };
}
