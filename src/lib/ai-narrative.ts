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

interface OpenAiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAiResponse {
  choices: Array<{ message: { content: string } }>;
}

const MODEL = "gpt-4o-mini";
const TEMPERATURE = 0.85;
const MAX_TOKENS = 250;

const SYSTEM_PROMPT = `Olet D&D 5e -kampanjan dungeon master, joka kertoo matkasta suoraan hahmoille. Kirjoitat lyhyitä mutta eläviä matkakuvauksia toisessa persoonassa (te), kuin puhuisit suoraan seurueelle. Käytä aistimuksia, tunnelmaa ja konkreettisia yksityiskohtia, mutta pysy selkeänä ja helposti luettavana.

Sisällytä kertomukseen:
- Kaikki vaiheen tapahtumat järjestyksessä: tauot, ateriat, leiriytyminen ja muut rutiinit
- Satunnaisesti 0–2 yksityiskohtaa, joissa jokin seurueen hahmo havaitsee tai tekee jotain
- Kohtaamisen kuvaus, jos sellainen on
- Jos käyttäjä on antanut DM-muistiinpanoja (DM notes), sisällytä ne kertomukseen sellaisenaan tai lyhennettynä

Sanaraja: enintään 100 sanaa. Jokainen kohtaaminen lisää sanarajan 25 sanalla.

Älä käytä markdown-otsikoita. Älä lisää DM-vihjeitä tai kysymyksiä loppuun. Kirjoita suomeksi.`;

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
 * Always returns a debug log alongside the (possibly null) narrative.
 */
export async function generateAiNarrative(
  stage: StageInput,
  characters: Character[],
  encounter?: EncounterResult,
  endDateFormatted?: string
): Promise<{ narrative: string | null; debugLog: AiDebugLog }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      narrative: null,
      debugLog: {
        apiKeyPresent: false,
        usedAi: false,
        failureReason: "OPENAI_API_KEY environment variable is not set on the server",
      },
    };
  }

  const userPrompt = buildUserPrompt(stage, characters, encounter, endDateFormatted);
  const baseDebugLog: Omit<AiDebugLog, "usedAi" | "failureReason"> = {
    apiKeyPresent: true,
    model: MODEL,
    temperature: TEMPERATURE,
    maxTokens: MAX_TOKENS,
    prompt: userPrompt,
  };

  const messages: OpenAiMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user",   content: userPrompt },
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
      }),
      // Abort after 60 s so a slow response doesn't stall the whole generation
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch {
        // ignore — can't read body
      }
      const reason = errorBody
        ? `HTTP ${response.status} ${response.statusText}: ${errorBody}`
        : `HTTP ${response.status} ${response.statusText}`;
      return { narrative: null, debugLog: { ...baseDebugLog, usedAi: false, failureReason: reason } };
    }

    const data: OpenAiResponse = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return {
        narrative: null,
        debugLog: {
          ...baseDebugLog,
          usedAi: false,
          failureReason: "OpenAI returned a successful response but the content was empty",
        },
      };
    }
    return { narrative: text, debugLog: { ...baseDebugLog, usedAi: true } };
  } catch (err) {
    const isTimeout =
      err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    const failureReason = isTimeout
      ? "Request timed out after 60 seconds"
      : `Network or parse error: ${err instanceof Error ? err.message : String(err)}`;
    return { narrative: null, debugLog: { ...baseDebugLog, usedAi: false, failureReason } };
  }
}
