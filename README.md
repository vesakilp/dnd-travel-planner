# 🏔️ DnD Travel Planner

A production-ready Next.js 15 App Router application for Dungeon Masters to plan wilderness journeys for their D&D parties. Calculate travel times, ration requirements, generate encounter rolls, and produce immersive narrative text for up to 3 journey stages.

## Features

- **Party management** — Add up to any number of adventurers with name, species, class, and level
- **3-stage journey planning** — Each stage has its own terrain, pace, season, vehicle, and distance
- **Travel calculation** — Computes effective miles/day with terrain multipliers and vehicle overrides
- **Rations tracking** — Per-character and total ration counts per stage and grand total
- **Random encounters** — d20 day and night encounter checks with monster lookup tables (d12)
- **Narrative generation** — Evocative scene-setting text with DM prompts for each stage
- **Auto-save** — Form data persists in localStorage every 3 seconds
- **Reproducible results** — Seeded PRNG for consistent encounter rolls

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Building for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

1. Push the repository to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Accept the default settings (Next.js is auto-detected)
4. Click **Deploy**

No environment variables are required.

## Configuration & Customization

### Terrain Multipliers

Edit `src/lib/terrain.ts` → `TERRAIN_CONFIG` to adjust how each terrain type affects travel speed:

```typescript
mountain: { label: "Mountain", multiplier: 0.5, ... },
grassland: { label: "Grassland", multiplier: 1.0, ... },
```

A multiplier of `0.5` means half normal speed; `1.0` means no change.

### Encounter Tables

Edit `src/lib/encounters.ts` → `DAY_TABLE` and `NIGHT_TABLE` to customize monsters, encounter ranges (on d12), and count expressions (e.g., `"1d6+3"`).

Encounters trigger on a d20 roll of 17 or higher. Change the threshold in `resolveEncounterRoll()`:

```typescript
const triggered = roll >= 17;
```

## Rule Assumptions

| Rule | Value |
|------|-------|
| Travel hours per day | 8 hours |
| Fast pace (overland) | 30 miles/day |
| Normal pace (overland) | 24 miles/day |
| Slow pace (overland) | 18 miles/day |
| Ration rounding | Ceiling (partial days = full ration) |
| Encounter trigger | d20 ≥ 17 |
| Encounter table | d12 (day and night separate tables) |
| Vehicle speed | miles/hr × 8 hours = miles/day |
| Waterborne default | Falls back to normal overland if no speed given |

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **React Hook Form + Zod** for form management and validation
- **Server Actions** for journey generation logic
- **Vitest** for unit testing
