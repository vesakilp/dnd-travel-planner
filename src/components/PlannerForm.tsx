"use client";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { PlannerFormSchema, PlannerFormData } from "@/lib/schema";
import { generateJourney } from "@/app/actions";
import { JourneyResult } from "@/lib/types";
import { DEFAULT_DR_DATE } from "@/lib/harptos";
import PartySection from "./PartySection";
import StageSection from "./StageSection";
import ResultsPanel from "./ResultsPanel";
import HarptosDatePicker from "./HarptosDatePicker";

const DEFAULT_STAGE = (stageNumber: number) => ({
  stageNumber,
  startLocation: "",
  startTimeOfDay: "morning" as const,
  endLocation: "",
  distanceMiles: 24,
  season: "summer" as const,
  terrain: "grassland" as const,
  pace: "normal" as const,
  vehicle: "none" as const,
  vehicleSpeedOverride: undefined,
  notes: "",
});

const STORAGE_KEY = "dnd-travel-planner-form";

export default function PlannerForm() {
  const [result, setResult] = useState<JourneyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PlannerFormData>({
    resolver: zodResolver(PlannerFormSchema),
    defaultValues: {
      characters: [
        { id: crypto.randomUUID(), name: "Doc Pohjola", species: "orc", characterClass: "druid", level: 3 },
        { id: crypto.randomUUID(), name: "Ismo Ylhälä", species: "goliath", characterClass: "rogue", level: 3 },
        { id: crypto.randomUUID(), name: "Kael Rook", species: "human", characterClass: "monk", level: 3 },
        { id: crypto.randomUUID(), name: "Aurelian Vexiar", species: "tiefling", characterClass: "warlock", level: 3 },
      ],
      stages: [DEFAULT_STAGE(1)],
      journeyStartDate: DEFAULT_DR_DATE,
    },
  });

  const { fields: stageFields, append: appendStage, remove: removeStage } = useFieldArray({
    control,
    name: "stages",
  });

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        reset(parsed);
      }
    } catch {
      // Ignore parse errors — corrupt storage is simply discarded
    }
  }, [reset]);

  // Auto-save to localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(getValues()));
      } catch {
        // Ignore storage quota errors — auto-save is best-effort
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [getValues]);

  async function onSubmit(data: PlannerFormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await generateJourney(data, "all");
      setResult(res);
      // Advance the journey start date to the last stage's arrival date
      if (res.lastEndDateRaw) {
        setValue("journeyStartDate", res.lastEndDateRaw);
      }
      setTimeout(() => {
        document.getElementById("results-heading")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (e) {
      console.error("Journey generation failed:", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function addStage() {
    const currentStages = getValues("stages");
    const previousStage = currentStages.at(-1);

    appendStage({
      ...DEFAULT_STAGE(currentStages.length + 1),
      startLocation: previousStage?.endLocation ?? "",
    });
  }

  function handleReturnJourney() {
    const current = getValues("stages");
    const reversed = [...current].reverse().map((stage, i) => ({
      ...stage,
      stageNumber: i + 1,
      startLocation: stage.endLocation,
      endLocation: stage.startLocation,
    }));
    reversed.forEach((stage, i) => {
      setValue(`stages.${i}`, stage);
    });
    setResult(null);
  }

  function handleNewJourney() {
    const confirmed = window.confirm(
      "Are you sure you want to start a new journey? The current stages will be wiped."
    );
    if (!confirmed) return;
    const characters = getValues("characters");
    const startDate = getValues("journeyStartDate") || DEFAULT_DR_DATE;
    reset({ characters, stages: [DEFAULT_STAGE(1)], journeyStartDate: startDate });
    setResult(null);
    setError(null);
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
        <PartySection register={register} control={control} errors={errors} />

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-amber-400">🧭 Journey Stages</h2>

          <div className="space-y-1">
            <label className="block text-sm text-amber-200">
              📅 Journey Start Date <span className="text-stone-500 text-xs">(Dale Reckoning)</span>
            </label>
            <HarptosDatePicker
              value={getValues("journeyStartDate") || DEFAULT_DR_DATE}
              onChange={(drString) => setValue("journeyStartDate", drString)}
            />
          </div>
          {errors.stages?.root && (
            <p className="text-red-400 text-sm">{errors.stages.root.message}</p>
          )}
          {stageFields.map((field, i) => (
            <StageSection
              key={field.id}
              stageIndex={i}
              register={register}
              control={control}
              errors={errors}
              canRemove={stageFields.length > 1}
              onRemove={() => removeStage(i)}
            />
          ))}
          <div className="flex justify-start">
            <button
              type="button"
              onClick={addStage}
              className="bg-amber-700 hover:bg-amber-600 text-white text-sm px-4 py-2 rounded transition-colors"
            >
              + Add Stage
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
          >
            ✨ Generate Journey
          </button>
          {result && (
            <button
              type="button"
              onClick={handleReturnJourney}
              disabled={loading}
              className="bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
            >
              🔄 Return Journey
            </button>
          )}
          <button
            type="button"
            onClick={handleNewJourney}
            disabled={loading}
            className="bg-stone-700 hover:bg-stone-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
          >
            🗺️ New Journey
          </button>
        </div>

        {loading && <p className="text-amber-300 animate-pulse">⏳ Generating your journey...</p>}
        {error && <p className="text-red-400">{error}</p>}
      </form>

      <ResultsPanel result={result} />
    </div>
  );
}
