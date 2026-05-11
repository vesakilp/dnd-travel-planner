import { EncounterDayResult, EncounterResult } from "./types";

export function normalizeEncounterDays(encounter?: EncounterResult): EncounterDayResult[] {
  if (!encounter) return [];
  if (encounter.dailyRolls?.length) return encounter.dailyRolls;
  return [{ dayNumber: 1, dayRoll: encounter.dayRoll, nightRoll: encounter.nightRoll }];
}
