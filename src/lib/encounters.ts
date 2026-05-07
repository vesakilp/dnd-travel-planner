import { EncounterResult, EncounterRoll } from "./types";
import { rollD, rollDiceExpression } from "./dice";

interface MonsterEntry {
  range: [number, number];
  name: string;
  countExpr: string;
}

const DAY_TABLE: MonsterEntry[] = [
  { range: [1, 2], name: "Stirges", countExpr: "1d8+2" },
  { range: [3, 4], name: "Ogre", countExpr: "1" },
  { range: [5, 6], name: "Goblins", countExpr: "1d6+3" },
  { range: [7, 8], name: "Hobgoblins", countExpr: "1d4+2" },
  { range: [9, 10], name: "Orcs", countExpr: "1d4+2" },
  { range: [11, 11], name: "Wolves", countExpr: "1d4+2" },
  { range: [12, 12], name: "Owlbear", countExpr: "1" },
];

const NIGHT_TABLE: MonsterEntry[] = [
  { range: [1, 3], name: "Stirges", countExpr: "1d8+2" },
  { range: [4, 4], name: "Ghouls", countExpr: "1d4+1" },
  { range: [5, 5], name: "Ogre", countExpr: "1" },
  { range: [6, 6], name: "Goblins", countExpr: "1d6+3" },
  { range: [7, 8], name: "Hobgoblins", countExpr: "1d4+2" },
  { range: [9, 10], name: "Orcs", countExpr: "1d4+2" },
  { range: [11, 12], name: "Owlbear", countExpr: "1" },
];

function lookupMonster(table: MonsterEntry[], roll: number): { name: string; count: string } {
  const entry = table.find((e) => roll >= e.range[0] && roll <= e.range[1]);
  if (!entry) return { name: "Unknown", count: "1" };
  const countNum =
    entry.countExpr === "1"
      ? 1
      : rollDiceExpression(entry.countExpr);
  return { name: entry.name, count: String(countNum) };
}

function resolveEncounterRoll(table: MonsterEntry[], rng?: () => number): EncounterRoll {
  const roll = rollD(20, rng);
  const triggered = roll >= 17;
  if (!triggered) return { roll, triggered };
  const tableRoll = rollD(12, rng);
  const monster = lookupMonster(table, tableRoll);
  return {
    roll,
    triggered,
    monsterName: monster.name,
    monsterCount: monster.count,
    tableRoll,
  };
}

export function generateEncounters(rng?: () => number): EncounterResult {
  return {
    dayRoll: resolveEncounterRoll(DAY_TABLE, rng),
    nightRoll: resolveEncounterRoll(NIGHT_TABLE, rng),
  };
}
