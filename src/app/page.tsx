import PlannerForm from "@/components/PlannerForm";

export const metadata = {
  title: "DnD Travel Planner",
  description: "Plan your D&D wilderness journey: travel time, rations, encounters, and narrative.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-amber-50 text-amber-950">
      <header className="bg-amber-100 border-b border-amber-300 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-900 font-title">🏔️ DnD Travel Planner</h1>
          <p className="text-amber-900 mt-1">Plan your party&apos;s wilderness journey one stage at a time, then add more as needed</p>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PlannerForm />
      </div>
    </main>
  );
}
