import type { ReactNode } from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3 } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";
import { Button } from "./button";
import { Card } from "./card";
import { ChartLegend, type ChartLegendItem } from "./charts/chart-legend";
import { EmptyState } from "./empty-state";
import { Skeleton } from "./loading-state";

export type ChartContainerProps = {
  title: ReactNode;
  description?: ReactNode;
  metric?: ReactNode;
  change?: number;
  changeLabel?: string;
  invertTrend?: boolean;
  actions?: ReactNode;
  legend?: ChartLegendItem[];
  height?: number;
  loading?: boolean;
  error?: ReactNode;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyMessage?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
};

const skeletonBars = [40, 65, 50, 80, 60, 90, 70, 85, 55, 75, 95, 68];

export function ChartContainer({
  title,
  description,
  metric,
  change,
  changeLabel = "vs previous period",
  invertTrend = false,
  actions,
  legend,
  height = 280,
  loading = false,
  error,
  onRetry,
  isEmpty = false,
  emptyMessage = "No data for the selected period.",
  footer,
  className,
  children,
}: ChartContainerProps) {
  const up = (change ?? 0) >= 0;
  const good = invertTrend ? !up : up;
  const TrendIcon = up ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4 px-5 pt-5">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-muted">{title}</h3>
          {metric !== undefined &&
            (loading ? (
              <Skeleton className="mt-2 h-7 w-32" />
            ) : (
              <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="type-metric">{metric}</span>
                {change !== undefined && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 font-mono text-xs font-medium tabular-nums",
                      good ? "text-success-text" : "text-danger-text",
                    )}
                  >
                    <TrendIcon className="size-3.5" aria-hidden />
                    {formatPercent(change)}
                    <span className="ml-1 font-sans font-normal text-subtle">{changeLabel}</span>
                  </span>
                )}
              </div>
            ))}
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {legend && legend.length > 0 && !loading && !error && (
        <ChartLegend items={legend} className="px-5 pt-4" />
      )}

      <div className="relative px-5 pb-5 pt-4" style={{ height }}>
        {loading ? (
          <div className="flex h-full items-end gap-2" aria-busy="true" aria-label="Loading chart">
            {skeletonBars.map((h, i) => (
              <Skeleton key={i} className="flex-1 rounded-xs" style={{ height: `${h}%` }} />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            tone="error"
            size="sm"
            icon={<AlertTriangle />}
            title="Couldn't load chart"
            description={error}
            action={
              onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry}>
                  Try again
                </Button>
              )
            }
            className="h-full py-0"
          />
        ) : isEmpty ? (
          <EmptyState
            size="sm"
            icon={<BarChart3 />}
            title="Nothing to show yet"
            description={emptyMessage}
            className="h-full py-0"
          />
        ) : (
          children
        )}
      </div>

      {footer && <div className="border-t border-border px-5 py-3 text-sm text-muted">{footer}</div>}
    </Card>
  );
}
