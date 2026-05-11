/**
 * Optional AI-powered narrative generation using the OpenAI API.
 *
 * Requires the OPENAI_API_KEY environment variable to be set on the server.
 * Falls back gracefully (returns null) when the key is absent or the call fails.
 *
 * No additional npm package is needed — this uses the native fetch API available
 * in Node.js 18+ and Next.js server actions.
 */

import { Character, StageInput, EncounterResult, AiDebugLog } from "./types";
import { normalizeEncounterDays } from "./encounter-days";

interface OpenAiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAiResponse {
  choices: Array<{ message: { content: string } }>;
}

const MODEL = "gpt-4o-mini";
const TEMPERATURE = 0.85;

const SYSTEM_PROMPT_EN = `You are a D&D 5e campaign dungeon master narrating a journey directly to the characters. Write short but vivid travel descriptions in second person (you/your party), as if speaking directly to the group. Use sensory details, atmosphere, and concrete imagery while remaining clear and easy to read.

Include in the narrative:
- All stage events in order: rests, meals, camping, and other routines
- Occasionally 1–2 details where a specific party member notices or does something
- A description of the encounter, if one occurred
- If the user provided DM notes, weave them in as-is or slightly condensed
- Format each day as its own paragraph starting with "Day N:" (for example "Day 1:")

Cover each travel day in sequence.
Length guidance (not a hard limit): for each travel day, aim for roughly the same amount of detail as your previous one-day output (about 100 words), and add about 25 extra words for each encounter that day.

Do not use markdown headings. Do not add DM hints or questions at the end. Write in English.`;

const SYSTEM_PROMPT_FI = `Olet D&D 5e -kampanjan dungeon master, joka kertoo matkasta suoraan hahmoille. Kirjoitat lyhyitä mutta eläviä matkakuvauksia toisessa persoonassa (te), kuin puhuisit suoraan seurueelle. Käytä aistimuksia, tunnelmaa ja konkreettisia yksityiskohtia, mutta pysy selkeänä ja helposti luettavana.

Sisällytä kertomukseen:
- Kaikki vaiheen tapahtumat järjestyksessä: tauot, ateriat, leiriytyminen ja muut rutiinit
- Satunnaisesti 0–2 yksityiskohtaa, joissa jokin seurueen hahmo havaitsee tai tekee jotain
- Kohtaamisen kuvaus, jos sellainen on
- Jos käyttäjä on antanut DM-muistiinpanoja (DM notes), sisällytä ne kertomukseen sellaisenaan tai lyhennettynä
- Muotoile jokainen päivä omaksi kappaleekseen niin, että se alkaa muodolla "Päivä N:" (esimerkiksi "Päivä 1:")

Kuvaa jokainen matkapäivä järjestyksessä.
Pituusohje (ei kova raja): pyri noin samaan yksityiskohtatasoon kuin aiemmassa yhden päivän kuvauksessa (noin 100 sanaa/päivä), ja lisää noin 25 sanaa jokaisesta sen päivän kohtaamisesta.

Älä käytä markdown-otsikoita. Älä lisää DM-vihjeitä tai kysymyksiä loppuun. Kirjoita suomeksi.`;

function buildUserPrompt(
  stage: StageInput,
  characters: Character[],
  encounter?: EncounterResult,
  endDateFormatted?: string,
  startDayNumber?: number,
  endDayNumber?: number
): string {
  const partyDesc = characters.length === 0
    ? "a lone traveler"
    : characters.map((c) =>
        `${c.name || "Unknown"} (${c.species || "unknown species"} ${c.characterClass || "adventurer"}, level ${c.level})`
      ).join(", ");

  const encounterDays = normalizeEncounterDays(encounter);

  const encounterDesc: string[] = encounterDays.map((day) => {
    const dayLine = day.dayRoll.triggered
      ? `${day.dayRoll.monsterCount} ${day.dayRoll.monsterName} (d20=${day.dayRoll.roll})`
      : `none (d20=${day.dayRoll.roll})`;
    const nightLine = day.nightRoll.triggered
      ? `${day.nightRoll.monsterCount} ${day.nightRoll.monsterName} (d20=${day.nightRoll.roll})`
      : `none (d20=${day.nightRoll.roll})`;
    return `Day ${day.dayNumber} encounters: day=${dayLine}; night=${nightLine}`;
  });

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

  if (startDayNumber !== undefined && endDayNumber !== undefined) {
    lines.push(`Journey days for this stage: Day ${startDayNumber} to Day ${endDayNumber}`);
  }

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
 * Always returns a debug log alongside the (possibly null) narratives.
 */
export async function generateAiNarrative(
  stage: StageInput,
  characters: Character[],
  encounter?: EncounterResult,
  endDateFormatted?: string,
  startDayNumber?: number,
  endDayNumber?: number
): Promise<{ narrative: string | null; narrativeFi: string | null; debugLog: AiDebugLog }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      narrative: null,
      narrativeFi: null,
      debugLog: {
        apiKeyPresent: false,
        usedAi: false,
        failureReason: "OPENAI_API_KEY environment variable is not set on the server",
      },
    };
  }

  const userPrompt = buildUserPrompt(
    stage,
    characters,
    encounter,
    endDateFormatted,
    startDayNumber,
    endDayNumber
  );
  const baseDebugLog: Omit<AiDebugLog, "usedAi" | "failureReason"> = {
    apiKeyPresent: true,
    model: MODEL,
    temperature: TEMPERATURE,
    prompt: userPrompt,
  };

  async function callOpenAi(systemPrompt: string): Promise<{ text: string | null; failureReason?: string }> {
    const messages: OpenAiMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: TEMPERATURE,
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      let errorBody = "";
      try { errorBody = await response.text(); } catch { /* ignore */ }
      const reason = errorBody
        ? `HTTP ${response.status} ${response.statusText}: ${errorBody}`
        : `HTTP ${response.status} ${response.statusText}`;
      return { text: null, failureReason: reason };
    }

    const data: OpenAiResponse = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || null;
    if (!text) return { text: null, failureReason: "OpenAI returned empty content" };
    return { text };
  }

  try {
    const [enResult, fiResult] = await Promise.all([
      callOpenAi(SYSTEM_PROMPT_EN),
      callOpenAi(SYSTEM_PROMPT_FI),
    ]);

    const usedAi = !!(enResult.text || fiResult.text);
    const failureParts: string[] = [];
    if (!enResult.text && enResult.failureReason) failureParts.push(`EN: ${enResult.failureReason}`);
    if (!fiResult.text && fiResult.failureReason) failureParts.push(`FI: ${fiResult.failureReason}`);

    return {
      narrative: enResult.text,
      narrativeFi: fiResult.text,
      debugLog: {
        ...baseDebugLog,
        usedAi,
        ...(failureParts.length > 0 && !usedAi
          ? { failureReason: failureParts.join("; ") }
          : failureParts.length > 0
            ? { failureReason: `Partial failure — ${failureParts.join("; ")}` }
            : {}),
      },
    };
  } catch (err) {
    const isTimeout =
      err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    const failureReason = isTimeout
      ? "Request timed out after 60 seconds"
      : `Network or parse error: ${err instanceof Error ? err.message : String(err)}`;
    return { narrative: null, narrativeFi: null, debugLog: { ...baseDebugLog, usedAi: false, failureReason } };
  }
}
