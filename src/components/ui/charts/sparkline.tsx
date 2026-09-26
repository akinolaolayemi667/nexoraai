import { useId, useMemo } from "react";
import { cn } from "@/lib/cn";
import { areaPath, linePath, safeId, scaleLinear, type Curve, type Point } from "./scale";

export type SparklineProps = {
  data: number[];
  color?: string;
  variant?: "line" | "area";
  curve?: Curve;
  strokeWidth?: number;
  className?: string;
  "aria-label"?: string;
};

const VIEW_W = 100;
const VIEW_H = 32;

export function Sparkline({
  data,
  color = "var(--color-chart-1)",
  variant = "area",
  curve = "monotone",
  strokeWidth = 1.5,
  className,
  "aria-label": ariaLabel,
}: SparklineProps) {
  const gradientId = safeId(useId());

  const { line, area } = useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const pad = 2;
    const y = scaleLinear([min, max === min ? min + 1 : max], [VIEW_H - pad, pad]);
    const points: Point[] = data.map((v, i) => [data.length <= 1 ? VIEW_W / 2 : (i / (data.length - 1)) * VIEW_W, y(v)]);
    return { line: linePath(points, curve), area: areaPath(points, VIEW_H, curve) };
  }, [data, curve]);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="none"
      className={cn("block h-8 w-24 overflow-visible", className)}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {variant === "area" && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.16} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradientId})`} />
        </>
      )}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
