import { Character } from "./types";
import { CharacterRations } from "./types";

export function calculateRations(characters: Character[], daysRequired: number): CharacterRations[] {
  const rationDays = Math.ceil(daysRequired);
  return characters.map((c) => ({
    characterId: c.id,
    characterName: c.name || "Unnamed",
    rations: rationDays,
  }));
}

export function totalRationsForStage(characterRations: CharacterRations[]): number {
  return characterRations.reduce((sum, cr) => sum + cr.rations, 0);
}
