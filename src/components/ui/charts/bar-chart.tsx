import { useId, useMemo, type PointerEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { formatCompact } from "@/lib/format";
import { duration, ease } from "@/lib/motion";
import { useElementSize } from "@/hooks/use-element-size";
import { seriesColor, xLabelStep, type CartesianChartProps } from "./area-chart";
import { ChartTooltip, tooltipPosition } from "./chart-tooltip";
import { barPath, niceTicks, readLabel, readNumber, safeId, scaleLinear } from "./scale";
import { chartFocusClass, useActiveIndex } from "./use-active-index";

export type BarChartProps<T extends object> = CartesianChartProps<T> & {
  layout?: "grouped" | "stacked";
  maxBarWidth?: number;
  radius?: number;
};

type Bar = { key: string; x: number; y: number; width: number; height: number; color: string; rounded: boolean };

export function BarChart<T extends object>({
  data,
  index,
  series,
  layout = "grouped",
  maxBarWidth = 36,
  radius = 3,
  valueFormatter = formatCompact,
  indexFormatter = (value) => value,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
  yAxisWidth = 44,
  className,
  "aria-label": ariaLabel = "Bar chart",
}: BarChartProps<T>) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const { active, setActive, containerProps } = useActiveIndex(data.length);
  const reduceMotion = useReducedMotion();
  const clipId = safeId(useId());

  const margin = { top: 8, right: 8, bottom: showXAxis ? 24 : 4, left: showYAxis ? yAxisWidth : 0 };
  const innerW = Math.max(0, width - margin.left - margin.right);
  const innerH = Math.max(0, height - margin.top - margin.bottom);
  const band = data.length ? innerW / data.length : 0;

  const { ticks, y, bars } = useMemo(() => {
    const values =
      layout === "stacked"
        ? data.map((row) => series.reduce((sum, s) => sum + Math.max(0, readNumber(row, s.key)), 0))
        : data.flatMap((row) => series.map((s) => readNumber(row, s.key)));
    const ticks = niceTicks(Math.min(0, ...values), Math.max(0, ...values), Math.max(2, Math.min(5, Math.floor(innerH / 40))));
    const y = scaleLinear([ticks[0], ticks[ticks.length - 1]], [innerH, 0]);
    const zero = y(0);
    const bars: Bar[][] = data.map((row, i) => {
      if (layout === "stacked") {
        const barW = Math.min(maxBarWidth, band * 0.6);
        const x = i * band + (band - barW) / 2;
        let running = 0;
        const visible = series.filter((s) => readNumber(row, s.key) > 0);
        return series.map((s, si) => {
          const value = Math.max(0, readNumber(row, s.key));
          const top = y(running + value);
          const bottom = y(running);
          running += value;
          return {
            key: s.key,
            x,
            y: top,
            width: barW,
            height: bottom - top,
            color: seriesColor(s, si),
            rounded: visible[visible.length - 1]?.key === s.key,
          };
        });
      }
      const gap = series.length > 1 ? 2 : 0;
      const barW = Math.min(maxBarWidth, (band * 0.7 - gap * (series.length - 1)) / series.length);
      const groupW = barW * series.length + gap * (series.length - 1);
      const start = i * band + (band - groupW) / 2;
      return series.map((s, si) => {
        const value = readNumber(row, s.key);
        const top = value >= 0 ? y(value) : zero;
        return {
          key: s.key,
          x: start + si * (barW + gap),
          y: top,
          width: barW,
          height: Math.abs(y(value) - zero),
          color: seriesColor(s, si),
          rounded: value > 0,
        };
      });
    });
    return { ticks, y, bars };
  }, [data, series, layout, innerH, band, maxBarWidth]);

  function onPointerMove(event: PointerEvent<SVGRectElement>) {
    if (!data.length) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    setActive(Math.max(0, Math.min(data.length - 1, Math.floor(ratio * data.length))));
  }

  const step = xLabelStep(data.length, innerW, 56);
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
          <g transform={`translate(${margin.left},${margin.top})`}>
            {active !== null && (
              <rect x={active * band} width={band} height={innerH} className="fill-sunken" rx={2} />
            )}

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
                    x={i * band + band / 2}
                    y={innerH + 18}
                    textAnchor="middle"
                    className={cn("text-2xs", active === i ? "fill-ink" : "fill-chart-axis")}
                  >
                    {indexFormatter(readLabel(row, index))}
                  </text>
                ) : null,
              )}

            <defs>
              <clipPath id={clipId}>
                <motion.rect
                  x={-1}
                  width={innerW + 2}
                  initial={reduceMotion ? false : { y: y(0), height: 0 }}
                  animate={{ y: -margin.top, height: innerH + margin.top + 1 }}
                  transition={{ duration: duration.slower, ease: ease.emphasized }}
                />
              </clipPath>
            </defs>
            <g clipPath={`url(#${clipId})`}>
              {bars.map((group, i) =>
                group.map((bar) =>
                  bar.rounded ? (
                    <path
                      key={`${i}-${bar.key}`}
                      d={barPath(bar.x, bar.y, bar.width, bar.height, radius)}
                      fill={bar.color}
                      opacity={active === null || active === i ? 1 : 0.55}
                      className="transition-opacity duration-150"
                    />
                  ) : (
                    <rect
                      key={`${i}-${bar.key}`}
                      x={bar.x}
                      y={bar.y}
                      width={Math.max(0, bar.width)}
                      height={Math.max(0, bar.height)}
                      fill={bar.color}
                      opacity={active === null || active === i ? 1 : 0.55}
                      className="transition-opacity duration-150"
                    />
                  ),
                ),
              )}
            </g>

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
          footer={
            layout === "stacked" && series.length > 1 ? (
              <span className="flex justify-between">
                Total
                <span className="font-mono font-medium tabular-nums text-ink">
                  {valueFormatter(series.reduce((sum, s) => sum + readNumber(data[active], s.key), 0))}
                </span>
              </span>
            ) : undefined
          }
          style={tooltipPosition(margin.left + active * band + band / 2, width, margin.top)}
        />
      )}
    </div>
  );
}
