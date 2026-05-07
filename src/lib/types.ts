export type Species = string;
export type CharacterClass = string;

export interface Character {
  id: string;
  name: string;
  species: string;
  characterClass: string;
  level: number;
}

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
export type Season = "winter" | "spring" | "summer" | "fall";
export type Terrain =
  | "arctic"
  | "coast"
  | "desert"
  | "forest"
  | "grassland"
  | "hill"
  | "mountain"
  | "swamp"
  | "underdark"
  | "urban"
  | "waterborne";
export type TravelPace = "fast" | "normal" | "slow";
export type VehicleType = "none" | "land_vehicle" | "waterborne";

export interface StageInput {
  stageNumber: 1 | 2 | 3;
  startLocation: string;
  startTimeOfDay: TimeOfDay;
  endLocation: string;
  distanceMiles: number;
  season: Season;
  terrain: Terrain;
  pace: TravelPace;
  vehicle: VehicleType;
  vehicleSpeedOverride?: number;
  notes?: string;
}

export interface EncounterRoll {
  roll: number;
  triggered: boolean;
  monsterName?: string;
  monsterCount?: string;
  tableRoll?: number;
}

export interface EncounterResult {
  dayRoll: EncounterRoll;
  nightRoll: EncounterRoll;
}

export interface CharacterRations {
  characterId: string;
  characterName: string;
  rations: number;
}

export interface StageResult {
  stageNumber: 1 | 2 | 3;
  effectiveMilesPerDay: number;
  daysRequired: number;
  humanReadableDuration: string;
  paceReminder: string;
  vehicleWarning?: string;
  characterRations: CharacterRations[];
  totalRations: number;
  encounter?: EncounterResult;
  narrative?: string;
}

export interface JourneyResult {
  stages: StageResult[];
  grandTotalRations: number;
}

export interface PlannerFormData {
  characters: Character[];
  stages: StageInput[];
}
