export const chartPalette = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
] as const;

export function chartColor(index: number) {
  return chartPalette[index % chartPalette.length];
}

export const zIndex = {
  sticky: 30,
  dropdown: 40,
  overlay: 50,
  toast: 60,
} as const;

export type Tone = "neutral" | "primary" | "accent" | "success" | "warning" | "danger";
