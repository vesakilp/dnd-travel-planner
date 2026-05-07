import PlannerForm from "@/components/PlannerForm";

export const metadata = {
  title: "DnD Travel Planner",
  description: "Plan your D&D wilderness journey: travel time, rations, encounters, and narrative.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-950 text-white">
      <header className="bg-stone-900 border-b border-amber-800 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-amber-400">🏔️ DnD Travel Planner</h1>
          <p className="text-stone-400 mt-1">Plan your party&apos;s wilderness journey one stage at a time, then add more as needed</p>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PlannerForm />
      </div>
    </main>
  );
}
