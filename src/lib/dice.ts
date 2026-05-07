// Seedable pseudo-random using a simple mulberry32 PRNG
export function createRng(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (Math.imul(36969, s & 65535) + (s >>> 16)) >>> 0;
    return (s >>> 0) / 4294967296;
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
