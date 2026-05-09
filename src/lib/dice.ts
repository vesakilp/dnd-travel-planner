// Seedable pseudo-random using the mulberry32 PRNG (full 32-bit output range)
export function createRng(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rollD(sides: number, rng?: () => number): number {
  const rand = rng ?? Math.random;
  return Math.floor(rand() * sides) + 1;
}

export function rollDiceExpression(expr: string, rng?: () => number): number {
  // e.g. "1d8+2", "1d4+1"
  const match = expr.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) return 0;
  const num = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const mod = match[3] ? parseInt(match[3]) : 0;
  let total = 0;
  for (let i = 0; i < num; i++) total += rollD(sides, rng);
  return Math.max(1, total + mod);
}
