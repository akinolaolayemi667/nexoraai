import { useId, useMemo, type PointerEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { formatCompact } from "@/lib/format";
import { duration, ease } from "@/lib/motion";
import { chartColor } from "@/lib/tokens";
import { useElementSize } from "@/hooks/use-element-size";
import { ChartTooltip, tooltipPosition } from "./chart-tooltip";
import {
  areaPath,
  linePath,
  niceTicks,
  readLabel,
  readNumber,
  safeId,
  scaleLinear,
  type Curve,
  type Point,
} from "./scale";
import { chartFocusClass, useActiveIndex } from "./use-active-index";

export type ChartSeries<K extends string = string> = { key: K; label: string; color?: string };

type Key<T> = Extract<keyof T, string>;

export type CartesianChartProps<T extends object> = {
  data: T[];
  index: Key<T>;
  series: ChartSeries<Key<T>>[];
  valueFormatter?: (value: number) => string;
  indexFormatter?: (value: string) => string;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showTooltip?: boolean;
  yAxisWidth?: number;
  className?: string;
  "aria-label"?: string;
};

export type AreaChartProps<T extends object> = CartesianChartProps<T> & {
  variant?: "area" | "line";
  curve?: Curve;
  showDots?: boolean;
};

export function seriesColor(series: ChartSeries, index: number) {
  return series.color ?? chartColor(index);
}

export function xLabelStep(count: number, innerWidth: number, minSpacing = 72) {
  return Math.max(1, Math.ceil(count / Math.max(1, Math.floor(innerWidth / minSpacing))));
}

export function AreaChart<T extends object>({
  data,
  index,
  series,
  variant = "area",
  curve = "monotone",
  showDots = false,
  valueFormatter = formatCompact,
  indexFormatter = (value) => value,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
  yAxisWidth = 44,
  className,
  "aria-label": ariaLabel = "Chart",
}: AreaChartProps<T>) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const { active, setActive, containerProps } = useActiveIndex(data.length);
  const gradientBase = safeId(useId());

  const margin = { top: 8, right: 8, bottom: showXAxis ? 24 : 4, left: showYAxis ? yAxisWidth : 0 };
  const innerW = Math.max(0, width - margin.left - margin.right);
  const innerH = Math.max(0, height - margin.top - margin.bottom);

  const { ticks, y, x, paths } = useMemo(() => {
    const values = data.flatMap((row) => series.map((s) => readNumber(row, s.key)));
    const ticks = niceTicks(Math.min(0, ...values), Math.max(0, ...values), Math.max(2, Math.min(5, Math.floor(innerH / 40))));
    const y = scaleLinear([ticks[0], ticks[ticks.length - 1]], [innerH, 0]);
    const x = (i: number) => (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const paths = series.map((s) => {
      const points: Point[] = data.map((row, i) => [x(i), y(readNumber(row, s.key))]);
      return { points, line: linePath(points, curve), area: areaPath(points, y(Math.max(0, ticks[0])), curve) };
    });
    return { ticks, y, x, paths };
  }, [data, series, innerW, innerH, curve]);

  function onPointerMove(event: PointerEvent<SVGRectElement>) {
    if (data.length === 0 || innerW === 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    setActive(Math.max(0, Math.min(data.length - 1, Math.round(ratio * (data.length - 1)))));
  }

  const step = xLabelStep(data.length, innerW);
  const ready = width > 0 && height > 0;

  return (
    <div
      ref={ref}
      role="figure"
      aria-label={ariaLabel}
      className={cn("relative size-full min-h-24", chartFocusClass, className)}
      {...containerProps}
    >
      {ready && (
        <svg width={width} height={height} className="absolute inset-0 overflow-visible" aria-hidden>
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.key} id={`${gradientBase}-${i}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={seriesColor(s, i)} stopOpacity={0.14} />
                <stop offset="100%" stopColor={seriesColor(s, i)} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <g transform={`translate(${margin.left},${margin.top})`}>
            {ticks.map((tick) => (
              <g key={tick} transform={`translate(0,${y(tick)})`}>
                {showGrid && (
                  <line
                    x1={0}
                    x2={innerW}
                    className={tick === 0 ? "stroke-border" : "stroke-chart-grid"}
                    shapeRendering="crispEdges"
                  />
                )}
                {showYAxis && (
                  <text x={-10} dy="0.32em" textAnchor="end" className="fill-chart-axis font-mono text-2xs">
                    {valueFormatter(tick)}
                  </text>
                )}
              </g>
            ))}

            {showXAxis &&
              data.map((row, i) =>
                i % step === 0 ? (
                  <text
                    key={i}
                    x={x(i)}
                    y={innerH + 18}
                    textAnchor={data.length > 1 && i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
                    className={cn("text-2xs", active === i ? "fill-ink" : "fill-chart-axis")}
                  >
                    {indexFormatter(readLabel(row, index))}
                  </text>
                ) : null,
              )}

            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: duration.slower, ease: ease.standard } }}
            >
              {variant === "area" &&
                paths.map((p, i) => <path key={series[i].key} d={p.area} fill={`url(#${gradientBase}-${i})`} />)}
              {paths.map((p, i) => (
                <path
                  key={series[i].key}
                  d={p.line}
                  fill="none"
                  stroke={seriesColor(series[i], i)}
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {showDots &&
                paths.map((p, i) =>
                  p.points.map(([px, py], j) => (
                    <circle
                      key={`${series[i].key}-${j}`}
                      cx={px}
                      cy={py}
                      r={2.5}
                      className="fill-white"
                      stroke={seriesColor(series[i], i)}
                      strokeWidth={1.5}
                    />
                  )),
                )}
            </motion.g>

            {active !== null && (
              <g pointerEvents="none">
                <line
                  x1={x(active)}
                  x2={x(active)}
                  y1={0}
                  y2={innerH}
                  className="stroke-border-strong"
                  strokeDasharray="3 3"
                />
                {paths.map((p, i) => (
                  <circle
                    key={series[i].key}
                    cx={p.points[active][0]}
                    cy={p.points[active][1]}
                    r={4}
                    fill={seriesColor(series[i], i)}
                    className="stroke-white"
                    strokeWidth={2}
                  />
                ))}
              </g>
            )}

            <rect
              width={innerW}
              height={innerH}
              fill="transparent"
              onPointerMove={onPointerMove}
              onPointerLeave={() => setActive(null)}
            />
          </g>
        </svg>
      )}

      {showTooltip && active !== null && data[active] && (
        <ChartTooltip
          title={indexFormatter(readLabel(data[active], index))}
          rows={series.map((s, i) => ({
            label: s.label,
            color: seriesColor(s, i),
            value: valueFormatter(readNumber(data[active], s.key)),
          }))}
          style={tooltipPosition(margin.left + x(active), width, margin.top)}
        />
      )}
    </div>
  );
}

export function LineChart<T extends object>(props: Omit<AreaChartProps<T>, "variant">) {
  return <AreaChart {...props} variant="line" />;
}
