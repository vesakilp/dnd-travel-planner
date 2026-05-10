"use client";
import { useFieldArray, UseFormRegister, Control, FieldErrors } from "react-hook-form";
import { PlannerFormData } from "@/lib/schema";
import CharacterCard from "./CharacterCard";

interface Props {
  register: UseFormRegister<PlannerFormData>;
  control: Control<PlannerFormData>;
  errors: FieldErrors<PlannerFormData>;
}

export default function PartySection({ register, control, errors }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: "characters" });

  function addCharacter() {
    append({ id: crypto.randomUUID(), name: "", species: "", characterClass: "", level: 1 });
  }

  return (
    <section aria-labelledby="party-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="party-heading" className="text-xl font-bold text-red-900 font-title">⚔️ Party & Characters</h2>
        <button
          type="button"
          onClick={addCharacter}
          className="bg-red-800 hover:bg-red-700 text-amber-50 text-sm px-4 py-2 rounded transition-colors"
        >
          + Add Adventurer
        </button>
      </div>
      {errors.characters?.root && (
        <p className="text-red-700 text-sm">{errors.characters.root.message}</p>
      )}
      {fields.map((field, index) => (
        <CharacterCard
          key={field.id}
          index={index}
          register={register}
          control={control}
          errors={errors}
          onRemove={() => remove(index)}
          canRemove={fields.length > 1}
        />
      ))}
    </section>
  );
}
