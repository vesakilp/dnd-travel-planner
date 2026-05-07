"use client";
import { JourneyResult } from "@/lib/types";

interface Props {
  result: JourneyResult | null;
}

export default function ResultsPanel({ result }: Props) {
  if (!result) {
    return (
      <section aria-labelledby="results-heading" className="border border-dashed border-stone-600 rounded-lg p-8 text-center text-stone-500">
        <p id="results-heading" className="text-lg">📜 Results will appear here after you generate the journey.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="results-heading" className="space-y-6">
      <h2 id="results-heading" className="text-xl font-bold text-amber-400">📜 Journey Results</h2>

      <div className="bg-amber-950/30 border border-amber-800 rounded-lg p-4 text-center">
        <p className="text-amber-200 text-lg">
          Grand Total Rations: <span className="font-bold text-white text-2xl">{result.grandTotalRations}</span>
        </p>
      </div>

      {result.stages.map((stage) => (
        <div key={stage.stageNumber} className="border border-stone-700 rounded-lg p-5 bg-stone-900/50 space-y-4">
          <h3 className="text-lg font-bold text-amber-300">Stage {stage.stageNumber}</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="bg-stone-800 rounded p-3">
              <p className="text-stone-400">Duration</p>
              <p className="text-white font-semibold">{stage.humanReadableDuration}</p>
            </div>
            <div className="bg-stone-800 rounded p-3">
              <p className="text-stone-400">Effective Pace</p>
              <p className="text-white font-semibold">{Math.round(stage.effectiveMilesPerDay * 10) / 10} mi/day</p>
            </div>
            <div className="bg-stone-800 rounded p-3">
              <p className="text-stone-400">Days Required</p>
              <p className="text-white font-semibold">{Math.round(stage.daysRequired * 10) / 10}</p>
            </div>
            <div className="bg-stone-800 rounded p-3">
              <p className="text-stone-400">Stage Rations</p>
              <p className="text-white font-semibold">{stage.totalRations}</p>
            </div>
          </div>

          <div className="bg-blue-950/40 border border-blue-800 rounded p-3 text-sm text-blue-200">
            ℹ️ {stage.paceReminder}
          </div>

          {stage.vehicleWarning && (
            <div className="bg-yellow-950/40 border border-yellow-700 rounded p-3 text-sm text-yellow-200">
              ⚠️ {stage.vehicleWarning}
            </div>
          )}

          {stage.characterRations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-amber-200 mb-2">Rations per Character</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-stone-400 text-left">
                    <th className="pb-1">Adventurer</th>
                    <th className="pb-1 text-right">Rations</th>
                  </tr>
                </thead>
                <tbody>
                  {stage.characterRations.map((cr) => (
                    <tr key={cr.characterId} className="border-t border-stone-700">
                      <td className="py-1 text-white">{cr.characterName}</td>
                      <td className="py-1 text-right text-white">{cr.rations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {stage.encounter && (
            <div className="bg-red-950/40 border border-red-800 rounded p-4 space-y-2">
              <h4 className="text-sm font-bold text-red-300">⚔️ Wilderness Encounters</h4>
              <EncounterRollDisplay label="Day Encounter Check" roll={stage.encounter.dayRoll} />
              <EncounterRollDisplay label="Night Encounter Check" roll={stage.encounter.nightRoll} />
            </div>
          )}

          {stage.narrative && (
            <div className="bg-stone-800/60 rounded p-4">
              <h4 className="text-sm font-bold text-amber-200 mb-2">📖 Narrative</h4>
              <div className="text-stone-200 text-sm whitespace-pre-wrap">{stage.narrative}</div>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

function EncounterRollDisplay({ label, roll }: { label: string; roll: import("@/lib/types").EncounterRoll }) {
  return (
    <div className="text-sm">
      <span className="text-stone-400">{label}: </span>
      <span className="text-white font-mono">d20={roll.roll}</span>
      {roll.triggered ? (
        <>
          <span className="text-red-400 ml-2">⚠ Encounter triggered!</span>
          <span className="text-stone-300 ml-2">
            d12={roll.tableRoll} → {roll.monsterCount} {roll.monsterName}
          </span>
        </>
      ) : (
        <span className="text-green-400 ml-2">✓ No encounter</span>
      )}
    </div>
  );
}
