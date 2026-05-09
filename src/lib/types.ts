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
  stageNumber: number;
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

export interface AiDebugLog {
  /** Whether the OPENAI_API_KEY was present on the server. */
  apiKeyPresent: boolean;
  /** The model used for generation (only set when the API key was present). */
  model?: string;
  /** The temperature setting used. */
  temperature?: number;
  /** The max_tokens limit used. */
  maxTokens?: number;
  /** The user prompt that was sent to the model. */
  prompt?: string;
  /** True when the AI response was used; false when the template fallback was used instead. */
  usedAi: boolean;
  /**
   * Human-readable explanation of why AI was not used (only set when usedAi is false).
   * Examples: missing API key, HTTP error details, timeout, empty response.
   */
  failureReason?: string;
}

export interface StageResult {
  stageNumber: number;
  effectiveMilesPerDay: number;
  daysRequired: number;
  humanReadableDuration: string;
  paceReminder: string;
  vehicleWarning?: string;
  characterRations: CharacterRations[];
  totalRations: number;
  encounter?: EncounterResult;
  narrative?: string;
  /** Debug information about how (or whether) OpenAI was used to generate the narrative. */
  aiDebugLog?: AiDebugLog;
  /** Calendar date the stage ends on (formatted string or "Day N" when no start date). */
  endDate?: string;
  /** 1-based journey day on which stage travel starts. */
  startDayNumber: number;
  /** Human-readable time of day when the stage starts: "Morning", "Afternoon", or "Evening". */
  startTimeLabel: string;
  /** 1-based journey day on which stage travel ends. */
  endDayNumber: number;
  /** Human-readable time of day when the stage ends: "Morning", "Afternoon", or "Evening". */
  endTimeLabel?: string;
}

export interface JourneyResult {
  stages: StageResult[];
  grandTotalRations: number;
  /** The raw "DR:year:dayOfYear" arrival date of the last stage, for chaining journeys. */
  lastEndDateRaw?: string;
}

export interface PlannerFormData {
  characters: Character[];
  stages: StageInput[];
  journeyStartDate?: string;
}
