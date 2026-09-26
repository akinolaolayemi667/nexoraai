export type Point = [x: number, y: number];
export type Curve = "linear" | "monotone";

const round = (value: number) => Math.round(value * 100) / 100;

function niceNumber(range: number, roundResult: boolean) {
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / 10 ** exponent;
  const nice = roundResult
    ? fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10
    : fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * 10 ** exponent;
}

export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) max = min === 0 ? 1 : min + Math.abs(min) * 0.5;
  const step = niceNumber(niceNumber(max - min, false) / Math.max(1, count - 1), true);
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= end + step / 2; value += step) ticks.push(Number(value.toFixed(10)));
  return ticks;
}

export function scaleLinear([d0, d1]: [number, number], [r0, r1]: [number, number]) {
  const span = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / span) * (r1 - r0);
}

export function linePath(points: Point[], curve: Curve = "monotone"): string {
  if (points.length === 0) return "";
  const [x0, y0] = points[0];
  if (points.length === 1) return `M${round(x0)},${round(y0)}`;
  if (curve === "linear" || points.length === 2) {
    return points.map(([x, y], i) => `${i ? "L" : "M"}${round(x)},${round(y)}`).join("");
  }

  // Monotone cubic interpolation (Fritsch–Carlson): never overshoots between data points.
  const n = points.length;
  const dx: number[] = [];
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = points[i + 1][0] - points[i][0];
    slopes[i] = dx[i] === 0 ? 0 : (points[i + 1][1] - points[i][1]) / dx[i];
  }
  const tangents: number[] = [slopes[0]];
  for (let i = 1; i < n - 1; i++) {
    const a = slopes[i - 1];
    const b = slopes[i];
    tangents[i] =
      a * b <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / a + (dx[i] + 2 * dx[i - 1]) / b);
  }
  tangents[n - 1] = slopes[n - 2];

  let d = `M${round(x0)},${round(y0)}`;
  for (let i = 0; i < n - 1; i++) {
    const [xa, ya] = points[i];
    const [xb, yb] = points[i + 1];
    const h = dx[i] / 3;
    d += `C${round(xa + h)},${round(ya + tangents[i] * h)} ${round(xb - h)},${round(yb - tangents[i + 1] * h)} ${round(xb)},${round(yb)}`;
  }
  return d;
}

export function areaPath(points: Point[], baseline: number, curve: Curve = "monotone"): string {
  if (points.length === 0) return "";
  const first = points[0][0];
  const last = points[points.length - 1][0];
  return `${linePath(points, curve)}L${round(last)},${round(baseline)}L${round(first)},${round(baseline)}Z`;
}

export function barPath(x: number, y: number, width: number, height: number, radius: number): string {
  if (width <= 0 || height <= 0) return "";
  const r = Math.min(radius, width / 2, height);
  return [
    `M${round(x)},${round(y + height)}`,
    `V${round(y + r)}`,
    `Q${round(x)},${round(y)} ${round(x + r)},${round(y)}`,
    `H${round(x + width - r)}`,
    `Q${round(x + width)},${round(y)} ${round(x + width)},${round(y + r)}`,
    `V${round(y + height)}Z`,
  ].join("");
}

function polar(cx: number, cy: number, r: number, angle: number): Point {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

export function arcPath(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  start: number,
  end: number,
): string {
  if (end - start >= Math.PI * 2 - 1e-6) {
    const mid = start + Math.PI;
    return `${arcPath(cx, cy, outer, inner, start, mid)}${arcPath(cx, cy, outer, inner, mid, end)}`;
  }
  const large = end - start > Math.PI ? 1 : 0;
  const [ox0, oy0] = polar(cx, cy, outer, start);
  const [ox1, oy1] = polar(cx, cy, outer, end);
  const [ix1, iy1] = polar(cx, cy, inner, end);
  const [ix0, iy0] = polar(cx, cy, inner, start);
  return [
    `M${round(ox0)},${round(oy0)}`,
    `A${outer},${outer} 0 ${large} 1 ${round(ox1)},${round(oy1)}`,
    `L${round(ix1)},${round(iy1)}`,
    `A${inner},${inner} 0 ${large} 0 ${round(ix0)},${round(iy0)}`,
    "Z",
  ].join("");
}

export function readNumber(row: object, key: string): number {
  const value = Number((row as Record<string, unknown>)[key]);
  return Number.isFinite(value) ? value : 0;
}

export function readLabel(row: object, key: string): string {
  return String((row as Record<string, unknown>)[key] ?? "");
}

export function safeId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "");
}
