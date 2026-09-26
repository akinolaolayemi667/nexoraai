/** Deterministic pseudo-random value in [0, 1) for demo series. */
export const noise = (i: number, seed: number) => {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Splits `total` across `weights` so the integer parts always add back up to `total`. */
export function distribute(total: number, weights: number[]) {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0) return weights.map(() => 0);
  const raw = weights.map((w) => (w / sum) * total);
  const result = raw.map(Math.floor);
  let remainder = total - result.reduce((a, b) => a + b, 0);
  const order = raw.map((value, i) => ({ fraction: value - result[i], i })).sort((a, b) => b.fraction - a.fraction);
  for (const { i } of order) {
    if (remainder <= 0) break;
    result[i] += 1;
    remainder -= 1;
  }
  return result;
}
