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

  // Track the current calendar position as we chain stages
  let currentDayIndex = 0;
  let currentSlotHour =
    data.stages.length > 0 ? timeOfDayToSlotHour(data.stages[0].startTimeOfDay) : 0;

  let lastEndDateRaw: string | undefined;

  const stages: StageResult[] = [];
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
    let narrative: string | undefined;

    if (mode === "challenges" || mode === "all") {
      encounter = generateEncounters(rng);
    }

    // Compute arrival date/time for this stage
    const travelHoursNeeded = daysRequired * 8;
    const arrival = computeArrival(currentDayIndex, currentSlotHour, travelHoursNeeded);
    const endDate = formatArrivalDate(data.journeyStartDate, arrival.dayIndex);
    const endTimeLabel = slotHourToLabel(arrival.slotHour);
    lastEndDateRaw = rawHarptosDate(data.journeyStartDate, arrival.dayIndex);

    if (mode === "narrative" || mode === "all") {
      // Attempt AI narrative first; fall back to the rich template
      const aiResult = await generateAiNarrative(
        normalizedStage,
        data.characters,
        encounter,
        endDate
      );
      narrative = aiResult ?? generateNarrative(normalizedStage, data.characters, encounter, {
        rng,
        endDateFormatted: endDate,
      });
    }

    // Advance the calendar cursor to the next stage's departure
    const nextStage = data.stages[index + 1];
    if (nextStage) {
      const dep = nextStageDeparture(
        arrival.dayIndex,
        arrival.slotHour,
        nextStage.startTimeOfDay
      );
      currentDayIndex = dep.dayIndex;
      currentSlotHour = dep.slotHour;
    }

    stages.push({
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
      endDate,
      endTimeLabel,
    });
  }

  const grandTotalRations = stages.reduce((sum, s) => sum + s.totalRations, 0);

  return { stages, grandTotalRations, lastEndDateRaw };
}

