"use client";
import { useState, useEffect, useRef } from "react";
import { UseFormRegister, FieldErrors, Control, useWatch } from "react-hook-form";
import { PlannerFormData } from "@/lib/schema";

interface Props {
  index: number;
  register: UseFormRegister<PlannerFormData>;
  control: Control<PlannerFormData>;
  errors: FieldErrors<PlannerFormData>;
  onRemove: () => void;
  canRemove: boolean;
}

export default function CharacterCard({ index, register, control, errors, onRemove, canRemove }: Props) {
  const charErrors = errors.characters?.[index];
  const nameValue = useWatch({ control, name: `characters.${index}.name` });
  // Start open; auto-close once a name appears (e.g. restored from localStorage),
  // but only if the user has not yet manually toggled the accordion.
  const [isOpen, setIsOpen] = useState(true);
  const userToggledRef = useRef(false);

  useEffect(() => {
    if (!userToggledRef.current && nameValue?.trim()) {
      setIsOpen(false);
    }
  }, [nameValue]);

  const displayName = nameValue?.trim() || `Adventurer ${index + 1}`;

  function toggle() {
    userToggledRef.current = true;
    setIsOpen((o) => !o);
  }

  return (
    <div className="border border-amber-700 rounded-lg bg-amber-950/30 overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-amber-900/30 transition-colors"
        aria-expanded={isOpen}
      >
        <h3 className="font-semibold text-amber-300">{displayName}</h3>
        <span className="text-amber-400 text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div
          className="px-4 pb-4 pt-1 space-y-3"
          onFocus={() => { userToggledRef.current = true; }}
        >
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

          {canRemove && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onRemove}
                className="text-red-400 hover:text-red-300 text-sm border border-red-800 hover:border-red-600 rounded px-3 py-1 transition-colors"
                aria-label={`Remove ${displayName}`}
              >
                Remove Adventurer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
