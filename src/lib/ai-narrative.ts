/**
 * Optional AI-powered narrative generation using the OpenAI API.
 *
 * Requires the OPENAI_API_KEY environment variable to be set on the server.
 * Falls back gracefully (returns null) when the key is absent or the call fails.
 *
 * No additional npm package is needed — this uses the native fetch API available
 * in Node.js 18+ and Next.js server actions.
 */

import { Character, StageInput, EncounterResult } from "./types";

interface OpenAiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAiResponse {
  choices: Array<{ message: { content: string } }>;
}

const SYSTEM_PROMPT = `Olet Dungeons & Dragons 5. painoksen kampanjoiden mestari-tarinankertoja, joka kertoo tarinoita Unohdettujen Valtakuntien (Faerûn) maailmassa. Kirjoitat atmosfäärisiä, mukaansatempaavia matkakertomuksia dungeon masterille luettavaksi tai muokattavaksi. Kirjoitustyylisi on eläväinen ja maanläheinen — herätteleviä yksityiskohtia säästä, maisemasta, äänistä ja tuoksuista sekä hahmokohtaisia hetkiä, jotka paljastavat persoonallisuuden toiminnan kautta. Pidä kertomus 3–5 kappaleessa. Sisällytä:
- Vuodenaikaan ja maastoon sopivat sääolosuhteet
- Tietty maisemayksityiskohta tai reittikohtainen tapahtuma
- Hetki, joka nostaa esiin yhden tai kaksi hahmoa (heidän luokkansa/rotunsa perusteella)
- Lyhyt leirikohtaus, joka kuvaa iltaa, ateriaa ja vahtivuoroa
- Kohtaamisen kuvaus, jos sellainen on
Älä käytä markdown-otsikoita. Käytä selkeää, romaanityylinen proosatyyli. Älä lisää DM-vihjeitä tai kysymyksiä loppuun. Kirjoita suomeksi.`;

function buildUserPrompt(
  stage: StageInput,
  characters: Character[],
  encounter?: EncounterResult,
  endDateFormatted?: string
): string {
  const partyDesc = characters.length === 0
    ? "a lone traveler"
    : characters.map((c) =>
        `${c.name || "Unknown"} (${c.species || "unknown species"} ${c.characterClass || "adventurer"}, level ${c.level})`
      ).join(", ");

  const encounterDesc: string[] = [];
  if (encounter?.dayRoll.triggered) {
    encounterDesc.push(`Day encounter: ${encounter.dayRoll.monsterCount} ${encounter.dayRoll.monsterName} (d20=${encounter.dayRoll.roll})`);
  }
  if (encounter?.nightRoll.triggered) {
    encounterDesc.push(`Night encounter: ${encounter.nightRoll.monsterCount} ${encounter.nightRoll.monsterName} (d20=${encounter.nightRoll.roll})`);
  }

  const lines = [
    `Stage: ${stage.startLocation} → ${stage.endLocation}`,
    `Distance: ${stage.distanceMiles} miles`,
    `Departure time: ${stage.startTimeOfDay}`,
    `Season: ${stage.season}`,
    `Terrain: ${stage.terrain}`,
    `Travel pace: ${stage.pace}`,
    `Vehicle: ${stage.vehicle}`,
    `Party: ${partyDesc}`,
  ];

  if (encounterDesc.length > 0) {
    lines.push(`Encounters: ${encounterDesc.join("; ")}`);
  } else {
    lines.push("Encounters: none this stage");
  }

  if (endDateFormatted) {
    lines.push(`The stage ends on: ${endDateFormatted}`);
  }

  if (stage.notes) {
    lines.push(`DM notes: ${stage.notes}`);
  }

  return lines.join("\n");
}

/**
 * Attempt to generate a narrative via the OpenAI API.
 * Returns null if OPENAI_API_KEY is not set or the request fails.
 */
export async function generateAiNarrative(
  stage: StageInput,
  characters: Character[],
  encounter?: EncounterResult,
  endDateFormatted?: string
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const messages: OpenAiMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user",   content: buildUserPrompt(stage, characters, encounter, endDateFormatted) },
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 700,
        temperature: 0.85,
      }),
      // Abort after 10 s so a slow response doesn't stall the whole generation
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) return null;

    const data: OpenAiResponse = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch {
    // Network error, timeout, or parse failure — fall back silently
    return null;
  }
}
