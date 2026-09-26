import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ProgressTone = "primary" | "accent" | "success" | "warning" | "danger" | "auto";

const tones: Record<Exclude<ProgressTone, "auto">, string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export type ProgressProps = {
  value: number;
  max?: number;
  tone?: ProgressTone;
  size?: "sm" | "md";
  label?: ReactNode;
  showValue?: boolean;
  valueFormatter?: (value: number, max: number) => ReactNode;
  className?: string;
};

export function Progress({
  value,
  max = 100,
  tone = "primary",
  size = "sm",
  label,
  showValue = false,
  valueFormatter = (v, m) => `${Math.round((v / m) * 100)}%`,
  className,
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const resolvedTone = tone === "auto" ? (pct >= 90 ? "danger" : pct >= 75 ? "warning" : "primary") : tone;

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
          {label && <span className="text-muted">{label}</span>}
          {showValue && <span className="text-metric text-xs font-medium text-ink">{valueFormatter(value, max)}</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn("w-full overflow-hidden rounded-full bg-sunken", size === "sm" ? "h-1.5" : "h-2")}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500 ease-emphasized", tones[resolvedTone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
