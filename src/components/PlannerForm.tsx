"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { PlannerFormSchema, PlannerFormData } from "@/lib/schema";
import { generateJourney, GenerateMode } from "@/app/actions";
import { JourneyResult } from "@/lib/types";
import PartySection from "./PartySection";
import StageSection from "./StageSection";
import ResultsPanel from "./ResultsPanel";

const DEFAULT_STAGE = (n: 1 | 2 | 3) => ({
  stageNumber: n,
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
    formState: { errors },
  } = useForm<PlannerFormData>({
    resolver: zodResolver(PlannerFormSchema),
    defaultValues: {
      characters: [{ id: crypto.randomUUID(), name: "", species: "", characterClass: "", level: 1 }],
      stages: [DEFAULT_STAGE(1), DEFAULT_STAGE(2), DEFAULT_STAGE(3)],
    },
  });

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        reset(parsed);
      }
    } catch {}
  }, [reset]);

  // Auto-save to localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(getValues()));
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [getValues]);

  async function onSubmit(data: PlannerFormData, mode: GenerateMode) {
    setLoading(true);
    setError(null);
    try {
      const res = await generateJourney(data, mode);
      setResult(res);
      setTimeout(() => {
        document.getElementById("results-heading")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleAction(mode: GenerateMode) {
    handleSubmit((data) => onSubmit(data, mode))();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={(e) => { e.preventDefault(); handleAction("all"); }} noValidate className="space-y-8">
        <PartySection register={register} control={control} errors={errors} />

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-amber-400">🧭 Journey Stages</h2>
          {[0, 1, 2].map((i) => (
            <StageSection
              key={i}
              stageIndex={i}
              register={register}
              control={control}
              errors={errors}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleAction("calculate")}
            disabled={loading}
            className="bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
          >
            📏 Calculate Travel & Rations
          </button>
          <button
            type="button"
            onClick={() => handleAction("narrative")}
            disabled={loading}
            className="bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
          >
            📖 Generate Narrative
          </button>
          <button
            type="button"
            onClick={() => handleAction("challenges")}
            disabled={loading}
            className="bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
          >
            ⚔️ Generate Challenges
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
          >
            ✨ Generate All
          </button>
        </div>

        {loading && <p className="text-amber-300 animate-pulse">⏳ Generating your journey...</p>}
        {error && <p className="text-red-400">{error}</p>}
      </form>

      <ResultsPanel result={result} />
    </div>
  );
}
