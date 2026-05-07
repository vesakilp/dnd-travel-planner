import { Character, StageInput, EncounterResult } from "./types";

const SEASON_FLAVOR: Record<string, string> = {
  winter: "frigid winds and snow-dusted trails",
  spring: "budding greenery and unpredictable showers",
  summer: "blazing heat and long golden hours",
  fall: "amber leaves and a chill in the air",
};

const TIME_FLAVOR: Record<string, string> = {
  morning: "at the first blush of dawn",
  afternoon: "under a high midday sun",
  evening: "as twilight paints the horizon",
  night: "beneath a canopy of stars",
};

const TERRAIN_FLAVOR: Record<string, string> = {
  arctic: "across ice-locked wastes",
  coast: "along windswept shores",
  desert: "through shimmering, sun-scorched sands",
  forest: "beneath interlaced boughs",
  grassland: "over rolling open plains",
  hill: "up and over rocky ridgelines",
  mountain: "along treacherous high-altitude paths",
  swamp: "through murky, reed-choked wetlands",
  underdark: "through lightless subterranean passages",
  urban: "along cobblestone streets and busy thoroughfares",
  waterborne: "across open waters",
};

const PACE_COMPLICATIONS: Record<string, string[]> = {
  fast: [
    "The relentless pace leaves little time for rest; boots are worn thin.",
    "Scouts struggle to keep watch while rushing — every shadow feels suspicious.",
    "A vital supply pouch is nearly lost in the scramble to keep moving.",
  ],
  normal: [
    "The steady rhythm of travel is occasionally broken by an unexpected detour.",
    "A faint trail off the main route catches a keen eye — where does it lead?",
    "Camp prep takes longer than expected after a full day of marching.",
  ],
  slow: [
    "Careful movement reveals hidden details the hurried traveler would miss.",
    "The party finds time to forage — small blessings along the road.",
    "A carefully mapped shortcut could save a full day's travel if trusted.",
  ],
};

export function generateNarrative(
  stage: StageInput,
  characters: Character[],
  encounter?: EncounterResult
): string {
  const partyList =
    characters.length === 0
      ? "a lone traveler"
      : characters
          .map((c) => `${c.name || "Unknown"} the ${c.species || "wanderer"} ${c.characterClass || ""}`.trim())
          .join(", ");

  const seasonFlavor = SEASON_FLAVOR[stage.season] ?? "the open road";
  const timeFlavor = TIME_FLAVOR[stage.startTimeOfDay] ?? "as the journey begins";
  const terrainFlavor = TERRAIN_FLAVOR[stage.terrain] ?? "across unfamiliar lands";
  const complications = PACE_COMPLICATIONS[stage.pace] ?? PACE_COMPLICATIONS["normal"];

  // Pick 1-2 complications deterministically based on stage number
  const comp1 = complications[stage.stageNumber % complications.length];
  const comp2 = complications[(stage.stageNumber + 1) % complications.length];

  let encounterLine = "";
  if (encounter?.dayRoll.triggered) {
    encounterLine = `\n• A daytime threat emerges: ${encounter.dayRoll.monsterCount} ${encounter.dayRoll.monsterName} block the road ahead.`;
  }
  if (encounter?.nightRoll.triggered) {
    encounterLine += `\n• Under cover of darkness, ${encounter.nightRoll.monsterCount} ${encounter.nightRoll.monsterName} circle the camp.`;
  }

  return `**Stage ${stage.stageNumber}: ${stage.startLocation} → ${stage.endLocation}**

${timeFlavor.charAt(0).toUpperCase() + timeFlavor.slice(1)}, ${partyList} set out from ${stage.startLocation}, pressing ${terrainFlavor} with ${seasonFlavor} marking the passage of ${stage.season}. The destination: ${stage.endLocation}, ${stage.distanceMiles} miles distant.

**Travel complications:**
• ${comp1}
• ${comp2}${encounterLine}

**DM prompts:**
• What secret or rumor does the party learn before they depart ${stage.startLocation}?
• How does the terrain between ${stage.startLocation} and ${stage.endLocation} change the party's dynamic — or reveal a character's hidden skill?`;
}
