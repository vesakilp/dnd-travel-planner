"use client";
import { UseFormRegister, FieldErrors, Control, useWatch } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { PlannerFormData } from "@/lib/schema";
import { TERRAIN_CONFIG } from "@/lib/terrain";
import { VEHICLE_OPTIONS, milesPerDay } from "@/lib/vehicle-options";
import { suggestForgottenRealmsDistance } from "@/app/actions";

interface Props {
  stageIndex: number;
  register: UseFormRegister<PlannerFormData>;
  control: Control<PlannerFormData>;
  errors: FieldErrors<PlannerFormData>;
  canRemove: boolean;
  onRemove: () => void;
}

export default function StageSection({ stageIndex, register, control, errors, canRemove, onRemove }: Props) {
  const stageErrors = errors.stages?.[stageIndex];
  const vehicle = useWatch({ control, name: `stages.${stageIndex}.vehicle` });
  const startLocation = useWatch({ control, name: `stages.${stageIndex}.startLocation` });
  const endLocation = useWatch({ control, name: `stages.${stageIndex}.endLocation` });
  const showSpeedOverride = vehicle === "land_vehicle" || vehicle === "waterborne";
  const availableVehicleOptions = showSpeedOverride ? VEHICLE_OPTIONS[vehicle] : [];
  const [distanceHint, setDistanceHint] = useState<string | null>(null);
  const latestRequestRef = useRef(0);

  useEffect(() => {
    const start = startLocation?.trim() ?? "";
    const end = endLocation?.trim() ?? "";
    if (!start || !end) {
      setDistanceHint(null);
      return;
    }

    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;
    setDistanceHint("🔎 Searching Forgotten Realms distance...");

    const timer = setTimeout(() => {
      void suggestForgottenRealmsDistance(start, end)
        .then((result) => {
          if (latestRequestRef.current !== requestId) return;
          setDistanceHint(`✨ ${result.message}`);
        })
        .catch(() => {
          if (latestRequestRef.current !== requestId) return;
          setDistanceHint("ℹ️ AI distance lookup failed. Keep using manual distance.");
        });
    }, 600);

    return () => clearTimeout(timer);
  }, [startLocation, endLocation]);

  return (
    <section aria-labelledby={`stage-${stageIndex + 1}-heading`} className="border border-stone-700 rounded-lg p-5 bg-stone-900/50 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 id={`stage-${stageIndex + 1}-heading`} className="text-xl font-bold text-amber-400">
          🗺️ Stage {stageIndex + 1}
        </h2>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="rounded bg-stone-800 px-3 py-2 text-sm text-stone-200 transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Remove Stage
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`stage-${stageIndex}-start`} className="block text-sm text-amber-200 mb-1">Start Location *</label>
          <input
            id={`stage-${stageIndex}-start`}
            {...register(`stages.${stageIndex}.startLocation`)}
            className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            placeholder="Neverwinter"
          />
          {stageErrors?.startLocation && <p className="text-red-400 text-xs mt-1">{stageErrors.startLocation.message}</p>}
        </div>

        <div>
          <label htmlFor={`stage-${stageIndex}-end`} className="block text-sm text-amber-200 mb-1">End Location *</label>
          <input
            id={`stage-${stageIndex}-end`}
            {...register(`stages.${stageIndex}.endLocation`)}
            className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            placeholder="Waterdeep"
          />
          {stageErrors?.endLocation && <p className="text-red-400 text-xs mt-1">{stageErrors.endLocation.message}</p>}
        </div>

        {stageIndex === 0 ? (
          <div>
            <label htmlFor={`stage-${stageIndex}-time`} className="block text-sm text-amber-200 mb-1">Departure Time *</label>
            <select
              id={`stage-${stageIndex}-time`}
              {...register(`stages.${stageIndex}.startTimeOfDay`)}
              className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>
          </div>
        ) : (
          <div className="bg-stone-800 rounded p-3 text-sm text-stone-300">
            Departure time is determined automatically from the previous stage.
          </div>
        )}

        <div>
          <label htmlFor={`stage-${stageIndex}-distance`} className="block text-sm text-amber-200 mb-1">Distance (miles) *</label>
          <input
            id={`stage-${stageIndex}-distance`}
            type="number"
            min={0.1}
            step={0.1}
            {...register(`stages.${stageIndex}.distanceMiles`, { valueAsNumber: true })}
            className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            placeholder="24"
          />
          {distanceHint && <p className="text-xs text-amber-300 mt-1">{distanceHint}</p>}
          {stageErrors?.distanceMiles && <p className="text-red-400 text-xs mt-1">{stageErrors.distanceMiles.message}</p>}
        </div>

        <div>
          <label htmlFor={`stage-${stageIndex}-season`} className="block text-sm text-amber-200 mb-1">Season *</label>
          <select
            id={`stage-${stageIndex}-season`}
            {...register(`stages.${stageIndex}.season`)}
            className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="spring">Spring</option>
            <option value="summer">Summer</option>
            <option value="fall">Fall</option>
            <option value="winter">Winter</option>
          </select>
        </div>

        <div>
          <label htmlFor={`stage-${stageIndex}-terrain`} className="block text-sm text-amber-200 mb-1">Terrain *</label>
          <select
            id={`stage-${stageIndex}-terrain`}
            {...register(`stages.${stageIndex}.terrain`)}
            className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            {Object.entries(TERRAIN_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`stage-${stageIndex}-pace`} className="block text-sm text-amber-200 mb-1">Travel Pace *</label>
          <select
            id={`stage-${stageIndex}-pace`}
            {...register(`stages.${stageIndex}.pace`)}
            className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="normal">Normal (24 mi/day)</option>
            <option value="fast">Fast (30 mi/day)</option>
            <option value="slow">Slow (18 mi/day)</option>
          </select>
        </div>

        <div>
          <label htmlFor={`stage-${stageIndex}-vehicle`} className="block text-sm text-amber-200 mb-1">Vehicle *</label>
          <select
            id={`stage-${stageIndex}-vehicle`}
            {...register(`stages.${stageIndex}.vehicle`)}
            className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="none">None (on foot)</option>
            <option value="land_vehicle">Land Vehicle</option>
            <option value="waterborne">Waterborne Vessel</option>
          </select>
        </div>

        {showSpeedOverride && (
          <div>
            <label htmlFor={`stage-${stageIndex}-speed`} className="block text-sm text-amber-200 mb-1">
              Vehicle
            </label>
            <select
              id={`stage-${stageIndex}-speed`}
              {...register(`stages.${stageIndex}.vehicleSpeedOverride`, {
                setValueAs: (value) => (value === "" ? undefined : Number(value)),
              })}
              className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="" disabled>
                Select a vehicle option
              </option>
              {availableVehicleOptions.map((option) => (
                <option key={option.label} value={option.milesPerHour}>
                  {option.label} ({milesPerDay(option.milesPerHour)} mi/day)
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="sm:col-span-2">
          <label htmlFor={`stage-${stageIndex}-notes`} className="block text-sm text-amber-200 mb-1">Notes (optional)</label>
          <textarea
            id={`stage-${stageIndex}-notes`}
            {...register(`stages.${stageIndex}.notes`)}
            rows={2}
            className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-y"
            placeholder="Any extra details for this leg of the journey..."
          />
        </div>
      </div>
    </section>
  );
}
