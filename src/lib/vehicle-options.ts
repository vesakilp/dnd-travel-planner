import { VehicleType } from "./types";

export interface VehicleOption {
  label: string;
  milesPerHour: number;
}

export const VEHICLE_OPTIONS: Record<Exclude<VehicleType, "none">, VehicleOption[]> = {
  land_vehicle: [
    { label: "Ox Cart", milesPerHour: 2 },
    { label: "Draft Horse Wagon", milesPerHour: 3 },
    { label: "Riding Horse", milesPerHour: 5 },
    { label: "Pony", milesPerHour: 4 },
    { label: "Mule", milesPerHour: 3 },
  ],
  waterborne: [
    { label: "Rowboat", milesPerHour: 3 },
    { label: "Keelboat", milesPerHour: 4 },
    { label: "Sailing Ship", milesPerHour: 5 },
    { label: "Longship", milesPerHour: 6 },
  ],
};

export function milesPerDay(milesPerHour: number): number {
  return milesPerHour * 8;
}
