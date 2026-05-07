import { z } from "zod";

export const CharacterSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  species: z.string().min(1, "Species is required"),
  characterClass: z.string().min(1, "Class is required"),
  level: z.number().int().min(1).max(20),
});

export const StageInputSchema = z.object({
  stageNumber: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  startLocation: z.string().min(1, "Start location is required"),
  startTimeOfDay: z.enum(["morning", "afternoon", "evening", "night"]),
  endLocation: z.string().min(1, "End location is required"),
  distanceMiles: z.number().positive("Distance must be a positive number"),
  season: z.enum(["winter", "spring", "summer", "fall"]),
  terrain: z.enum([
    "arctic", "coast", "desert", "forest", "grassland",
    "hill", "mountain", "swamp", "underdark", "urban", "waterborne",
  ]),
  pace: z.enum(["fast", "normal", "slow"]),
  vehicle: z.enum(["none", "land_vehicle", "waterborne"]),
  vehicleSpeedOverride: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const PlannerFormSchema = z.object({
  characters: z.array(CharacterSchema).min(1, "Add at least one character"),
  stages: z.array(StageInputSchema).length(3),
});

export type PlannerFormData = z.infer<typeof PlannerFormSchema>;
