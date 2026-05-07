"use client";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { PlannerFormData } from "@/lib/schema";

interface Props {
  index: number;
  register: UseFormRegister<PlannerFormData>;
  errors: FieldErrors<PlannerFormData>;
  onRemove: () => void;
  canRemove: boolean;
}

export default function CharacterCard({ index, register, errors, onRemove, canRemove }: Props) {
  const charErrors = errors.characters?.[index];
  return (
    <div className="border border-amber-700 rounded-lg p-4 bg-amber-950/30 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-amber-300">Adventurer {index + 1}</h3>
        {canRemove && (
          <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-300 text-sm" aria-label={`Remove adventurer ${index + 1}`}>
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`char-name-${index}`} className="block text-sm text-amber-200 mb-1">Name *</label>
          <input
            id={`char-name-${index}`}
            {...register(`characters.${index}.name`)}
            className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            placeholder="Thalindra"
          />
          {charErrors?.name && <p className="text-red-400 text-xs mt-1">{charErrors.name.message}</p>}
        </div>

        <div>
          <label htmlFor={`char-species-${index}`} className="block text-sm text-amber-200 mb-1">Species *</label>
          <input
            id={`char-species-${index}`}
            {...register(`characters.${index}.species`)}
            className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            placeholder="Elf"
          />
          {charErrors?.species && <p className="text-red-400 text-xs mt-1">{charErrors.species.message}</p>}
        </div>

        <div>
          <label htmlFor={`char-class-${index}`} className="block text-sm text-amber-200 mb-1">Class *</label>
          <input
            id={`char-class-${index}`}
            {...register(`characters.${index}.characterClass`)}
            className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            placeholder="Ranger"
          />
          {charErrors?.characterClass && <p className="text-red-400 text-xs mt-1">{charErrors.characterClass.message}</p>}
        </div>

        <div>
          <label htmlFor={`char-level-${index}`} className="block text-sm text-amber-200 mb-1">Level *</label>
          <input
            id={`char-level-${index}`}
            type="number"
            min={1}
            max={20}
            {...register(`characters.${index}.level`, { valueAsNumber: true })}
            className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            placeholder="5"
          />
          {charErrors?.level && <p className="text-red-400 text-xs mt-1">{charErrors.level.message}</p>}
        </div>
      </div>
    </div>
  );
}
