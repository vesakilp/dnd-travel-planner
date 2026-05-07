import { TravelPace, VehicleType } from "./types";

export const PACE_CONFIG: Record<TravelPace, { milesPerHour: number; milesPerDay: number; reminder: string }> = {
  fast: {
    milesPerHour: 4,
    milesPerDay: 30,
    reminder: "Fast pace: disadvantage on Perception, Survival, and Stealth checks.",
  },
  normal: {
    milesPerHour: 3,
    milesPerDay: 24,
    reminder: "Normal pace: disadvantage on Stealth checks.",
  },
  slow: {
    milesPerHour: 2,
    milesPerDay: 18,
    reminder: "Slow pace: advantage on Perception and Survival checks.",
  },
};

export function getEffectiveMilesPerDay(
  pace: TravelPace,
  terrainMultiplier: number,
  vehicle: VehicleType,
  vehicleSpeedOverride?: number
): { effectiveMilesPerDay: number; warning?: string } {
  let baseMilesPerDay = PACE_CONFIG[pace].milesPerDay;
  let warning: string | undefined;

  if (vehicle === "waterborne") {
    if (vehicleSpeedOverride != null && vehicleSpeedOverride > 0) {
      baseMilesPerDay = vehicleSpeedOverride * 8; // 8 travel hours
    } else {
      warning = "Waterborne vessel speed not specified — falling back to normal overland pace.";
      baseMilesPerDay = PACE_CONFIG["normal"].milesPerDay;
    }
  } else if (vehicle === "land_vehicle") {
    if (vehicleSpeedOverride != null && vehicleSpeedOverride > 0) {
      baseMilesPerDay = vehicleSpeedOverride * 8;
    }
    // else keep standard overland pace
  }

  const effective = baseMilesPerDay * terrainMultiplier;
  return { effectiveMilesPerDay: Math.max(1, effective), warning };
}

export function formatDuration(days: number): string {
  const fullDays = Math.floor(days);
  const remainingHours = Math.round((days - fullDays) * 8);
  if (fullDays === 0) return `${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`;
  if (remainingHours === 0) return `${fullDays} day${fullDays !== 1 ? "s" : ""}`;
  return `${fullDays} day${fullDays !== 1 ? "s" : ""} and ${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`;
}
