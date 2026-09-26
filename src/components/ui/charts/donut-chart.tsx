import { useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { formatCompact } from "@/lib/format";
import { duration, ease } from "@/lib/motion";
import { chartColor } from "@/lib/tokens";
import { useElementSize } from "@/hooks/use-element-size";
import { arcPath } from "./scale";
import { chartFocusClass, useActiveIndex } from "./use-active-index";

export type DonutDatum = { label: string; value: number; color?: string };

export type DonutChartProps = {
  data: DonutDatum[];
  valueFormatter?: (value: number) => string;
  centerLabel?: ReactNode;
  centerValue?: ReactNode;
  thickness?: number;
  className?: string;
  "aria-label"?: string;
};

export function donutColor(datum: DonutDatum, index: number) {
  return datum.color ?? chartColor(index);
}

export function DonutChart({
  data,
  valueFormatter = formatCompact,
  centerLabel = "Total",
  centerValue,
  thickness,
  className,
  "aria-label": ariaLabel = "Donut chart",
}: DonutChartProps) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const { active, setActive, containerProps } = useActiveIndex(data.length);

  const size = Math.min(width, height);
  const outer = size / 2 - 2;
  const inner = Math.max(0, outer - (thickness ?? Math.min(28, Math.max(12, outer * 0.24))));
  const total = data.reduce((sum, d) => sum + Math.max(0, d.value), 0);

  const arcs = useMemo(() => {
    const pad = data.filter((d) => d.value > 0).length > 1 ? 0.014 : 0;
    let angle = -Math.PI / 2;
    return data.map((d) => {
      const sweep = total > 0 ? (Math.max(0, d.value) / total) * Math.PI * 2 : 0;
      const start = angle + (sweep > pad ? pad / 2 : 0);
      const end = angle + sweep - (sweep > pad ? pad / 2 : 0);
      angle += sweep;
      return { start, end, sweep };
    });
  }, [data, total]);

  const cx = width / 2;
  const cy = height / 2;
  const activeDatum = active !== null ? data[active] : null;

  return (
    <div
      ref={ref}
      role="figure"
      aria-label={ariaLabel}
      className={cn("relative size-full min-h-32", chartFocusClass, className)}
      {...containerProps}
    >
      {size > 0 && (
        <svg width={width} height={height} className="absolute inset-0" aria-hidden>
          <circle
            cx={cx}
            cy={cy}
            r={(outer + inner) / 2}
            fill="none"
            className="stroke-sunken"
            strokeWidth={outer - inner}
          />
          <motion.g
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: duration.slow, ease: ease.emphasized } }}
          >
            {data.map((d, i) =>
              arcs[i].sweep > 0 ? (
                <path
                  key={d.label}
                  d={arcPath(cx, cy, active === i ? outer + 2 : outer, inner, arcs[i].start, arcs[i].end)}
                  fill={donutColor(d, i)}
                  opacity={active === null || active === i ? 1 : 0.4}
                  className="transition-opacity duration-150"
                  onPointerEnter={() => setActive(i)}
                  onPointerLeave={() => setActive(null)}
                />
              ) : null,
            )}
          </motion.g>
        </svg>
      )}

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="max-w-[60%] truncate text-xs text-muted">{activeDatum ? activeDatum.label : centerLabel}</span>
        <span className="text-metric text-xl font-semibold text-ink">
          {activeDatum ? valueFormatter(activeDatum.value) : (centerValue ?? valueFormatter(total))}
        </span>
        {activeDatum && total > 0 && (
          <span className="font-mono text-2xs text-subtle">
            {((activeDatum.value / total) * 100).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
