"use server";

import { PlannerFormData, StageResult, JourneyResult } from "@/lib/types";
import { getEffectiveMilesPerDay, formatDuration, PACE_CONFIG } from "@/lib/pace";
import { getTerrainMultiplier } from "@/lib/terrain";
import { calculateRations, totalRationsForStage } from "@/lib/rations";
import { generateEncounters } from "@/lib/encounters";
import { generateNarrative } from "@/lib/narrative";
import { generateAiNarrative } from "@/lib/ai-narrative";
import { createRng } from "@/lib/dice";
import {
  timeOfDayToSlotHour,
  computeArrival,
  nextStageDeparture,
  slotHourToLabel,
  formatArrivalDate,
  rawHarptosDate,
} from "@/lib/travel-time";

export type GenerateMode = "calculate" | "narrative" | "challenges" | "all";

export async function generateJourney(
  data: PlannerFormData,
  mode: GenerateMode,
  seed?: number
): Promise<JourneyResult> {
  const rng = createRng(seed ?? Date.now());

  // Build stage data without narratives first
  type StageData = Omit<StageResult, "narrative"> & {
    normalizedStage: typeof data.stages[0] & { stageNumber: number };
    encounter?: import("@/lib/types").EncounterResult;
    endDate: string;
  };

  const stageData: StageData[] = [];
  let currentDayIndex = 0;
  let currentSlotHour =
    data.stages.length > 0 ? timeOfDayToSlotHour(data.stages[0].startTimeOfDay) : 0;
  let lastEndDateRaw: string | undefined;

  for (let index = 0; index < data.stages.length; index++) {
    const stage = data.stages[index];
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
    if (mode === "challenges" || mode === "all") {
      encounter = generateEncounters(rng);
    }

    const travelHoursNeeded = daysRequired * 8;
    const arrival = computeArrival(currentDayIndex, currentSlotHour, travelHoursNeeded);
    const endDate = formatArrivalDate(data.journeyStartDate, arrival.dayIndex);
    const endTimeLabel = slotHourToLabel(arrival.slotHour);
    lastEndDateRaw = rawHarptosDate(data.journeyStartDate, arrival.dayIndex);

    const nextStage = data.stages[index + 1];
    if (nextStage) {
      const dep = nextStageDeparture(arrival.dayIndex, arrival.slotHour, nextStage.startTimeOfDay);
      currentDayIndex = dep.dayIndex;
      currentSlotHour = dep.slotHour;
    }

    stageData.push({
      stageNumber,
      effectiveMilesPerDay,
      daysRequired,
      humanReadableDuration,
      paceReminder,
      vehicleWarning: warning,
      characterRations,
      totalRations,
      encounter,
      endDate,
      endTimeLabel,
      normalizedStage,
    });
  }

  // Generate all narratives in parallel (AI calls or templates)
  const narrativePromises = stageData.map(async (sd) => {
    if (mode !== "narrative" && mode !== "all") return undefined;
    const aiResult = await generateAiNarrative(
      sd.normalizedStage,
      data.characters,
      sd.encounter,
      sd.endDate
    );
    return aiResult ?? generateNarrative(sd.normalizedStage, data.characters, sd.encounter, {
      rng,
      endDateFormatted: sd.endDate,
    });
  });

  const narratives = await Promise.allSettled(narrativePromises);

  const stages: StageResult[] = stageData.map((sd, i) => {
    const narrativeResult = narratives[i];
    const narrative = narrativeResult.status === "fulfilled" ? narrativeResult.value : undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { normalizedStage: _norm, ...rest } = sd;
    return { ...rest, narrative };
  });

  const grandTotalRations = stages.reduce((sum, s) => sum + s.totalRations, 0);

  return { stages, grandTotalRations, lastEndDateRaw };
}

