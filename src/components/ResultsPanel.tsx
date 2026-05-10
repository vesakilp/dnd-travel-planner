"use client";
import { JourneyResult } from "@/lib/types";
import { formatDuration } from "@/lib/pace";

interface Props {
  result: JourneyResult | null;
}

export default function ResultsPanel({ result }: Props) {
  if (!result) {
    return (
      <section aria-labelledby="results-heading" className="border border-dashed border-amber-400 rounded-lg p-8 text-center text-amber-800">
        <p id="results-heading" className="text-lg">📜 Results will appear here after you generate the journey.</p>
      </section>
    );
  }

  // Aggregate rations per character across all stages
  const rationsByCharacter = new Map<string, { name: string; total: number }>();
  for (const stage of result.stages) {
    for (const cr of stage.characterRations) {
      const existing = rationsByCharacter.get(cr.characterId);
      if (existing) {
        existing.total += cr.rations;
      } else {
        rationsByCharacter.set(cr.characterId, { name: cr.characterName, total: cr.rations });
      }
    }
  }
  const characterTotals = Array.from(rationsByCharacter.entries()).map(([id, v]) => ({ id, ...v }));

  // Total journey time (sum of all stages' daysRequired, includes camping nights)
  const totalDays = result.stages.reduce((sum, s) => sum + s.daysRequired, 0);
  const totalDuration = formatDuration(totalDays);

  return (
    <section aria-labelledby="results-heading" className="space-y-6">
      <h2 id="results-heading" className="text-xl font-bold text-red-900 font-title">📜 Journey Results</h2>

      <div className="bg-amber-100/70 border border-amber-300 rounded-lg p-4 space-y-4">
        <div className="text-center">
          <p className="text-amber-800 text-sm mb-1">⏱ Total Journey Time</p>
          <p className="text-red-900 font-bold text-2xl font-title">{totalDuration}</p>
        </div>

        {characterTotals.length > 0 && (
          <div>
            <p className="text-amber-900 text-sm font-semibold mb-2">🎒 Total Rations per Adventurer</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-amber-800 text-left">
                  <th className="pb-1">Adventurer</th>
                  <th className="pb-1 text-right">Total Rations</th>
                </tr>
              </thead>
              <tbody>
                {characterTotals.map((ct) => (
                  <tr key={ct.id} className="border-t border-amber-300">
                    <td className="py-1 text-amber-950">{ct.name}</td>
                    <td className="py-1 text-right text-amber-950 font-semibold">{ct.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {result.stages.map((stage) => (
        <div key={stage.stageNumber} className="border border-amber-300 rounded-lg p-5 bg-amber-100/70 space-y-4">
          <h3 className="text-lg font-bold text-red-900 font-title">Stage {stage.stageNumber}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-amber-50 rounded p-3">
              <p className="text-amber-800">Stage Start</p>
              <p className="text-amber-950 font-semibold">
                Day {stage.startDayNumber}, {formatTimeLabel(stage.startTimeLabel)}
              </p>
            </div>
            <div className="bg-amber-50 rounded p-3">
              <p className="text-amber-800">Stage End</p>
              <p className="text-amber-950 font-semibold">
                Day {stage.endDayNumber}, {formatTimeLabel(stage.endTimeLabel)}
              </p>
            </div>
            <div className="bg-amber-50 rounded p-3">
              <p className="text-amber-800">Days Required</p>
              <p className="text-amber-950 font-semibold">{Math.round(stage.daysRequired * 10) / 10}</p>
            </div>
          </div>

          {stage.vehicleWarning && (
            <div className="bg-yellow-100 border border-yellow-500 rounded p-3 text-sm text-yellow-900">
              ⚠️ {stage.vehicleWarning}
            </div>
          )}

          {stage.encounter && (
            <div className="bg-red-100 border border-red-400 rounded p-4 space-y-2">
              <h4 className="text-sm font-bold text-red-900 font-title">⚔️ Wilderness Encounters</h4>
              <EncounterRollDisplay label="Day Encounter Check" roll={stage.encounter.dayRoll} />
              <EncounterRollDisplay label="Night Encounter Check" roll={stage.encounter.nightRoll} />
            </div>
          )}

          {(stage.narrative || stage.narrativeFi) && (
            <div className="bg-amber-50/80 rounded p-4">
              <h4 className="text-sm font-bold text-red-900 mb-2 font-title">📖 Narrative</h4>
              {stage.narrative && (
                <div className="text-amber-950 text-sm whitespace-pre-wrap">{stage.narrative}</div>
              )}
              {stage.narrativeFi && (
                <div className="text-amber-950 text-sm whitespace-pre-wrap mt-3 pt-3 border-t border-amber-200">{stage.narrativeFi}</div>
              )}
            </div>
          )}

          {stage.aiDebugLog && (
            <details className="bg-amber-50 border border-amber-300 rounded p-3 text-xs text-amber-800">
              <summary className="cursor-pointer font-semibold text-amber-900 select-none">
                🤖 OpenAI Debug Log
              </summary>
              <div className="mt-3 space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-amber-100 rounded px-2 py-0.5">
                    API key: <span className={stage.aiDebugLog.apiKeyPresent ? "text-green-700" : "text-red-700"}>
                      {stage.aiDebugLog.apiKeyPresent ? "present" : "missing"}
                    </span>
                  </span>
                  <span className="bg-amber-100 rounded px-2 py-0.5">
                    AI used: <span className={stage.aiDebugLog.usedAi ? "text-green-700" : "text-yellow-700"}>
                      {stage.aiDebugLog.usedAi ? "yes" : "no (template fallback)"}
                    </span>
                  </span>
                  {stage.aiDebugLog.model && (
                    <span className="bg-amber-100 rounded px-2 py-0.5">
                      model: <span className="text-amber-950">{stage.aiDebugLog.model}</span>
                    </span>
                  )}
                  {stage.aiDebugLog.temperature !== undefined && (
                    <span className="bg-amber-100 rounded px-2 py-0.5">
                      temperature: <span className="text-amber-950">{stage.aiDebugLog.temperature}</span>
                    </span>
                  )}
                  {stage.aiDebugLog.maxTokens !== undefined && (
                    <span className="bg-amber-100 rounded px-2 py-0.5">
                      max_tokens: <span className="text-amber-950">{stage.aiDebugLog.maxTokens}</span>
                    </span>
                  )}
                </div>
                {stage.aiDebugLog.failureReason && (
                  <div className="bg-red-100 border border-red-400 rounded px-2 py-1.5 text-red-800">
                    <span className="font-semibold">Reason AI was not used: </span>
                    {stage.aiDebugLog.failureReason}
                  </div>
                )}
                {stage.aiDebugLog.prompt && (
                  <div>
                    <p className="text-amber-800 mb-1 font-semibold">User prompt sent to OpenAI:</p>
                    <pre className="bg-amber-100 rounded p-2 whitespace-pre-wrap text-amber-900 leading-relaxed">
                      {stage.aiDebugLog.prompt}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      ))}
    </section>
  );
}

function formatTimeLabel(timeLabel: string): string {
  return timeLabel.toLowerCase();
}

function EncounterRollDisplay({ label, roll }: { label: string; roll: import("@/lib/types").EncounterRoll }) {
  return (
    <div className="text-sm">
      <span className="text-amber-800">{label}: </span>
      <span className="text-amber-950 font-mono">d20={roll.roll}</span>
      {roll.triggered ? (
        <>
          <span className="text-red-700 ml-2">⚠ Encounter triggered!</span>
          <span className="text-amber-900 ml-2">
            d12={roll.tableRoll} → {roll.monsterCount} {roll.monsterName}
          </span>
        </>
      ) : (
          <span className="text-green-700 ml-2">✓ No encounter</span>
      )}
    </div>
  );
}
