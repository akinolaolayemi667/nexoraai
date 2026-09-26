import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, BarChart3 } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";
import { Card } from "./card";
import { EmptyState } from "./empty-state";
import { Skeleton } from "./loading-state";

export type ChartLegendItem = { label: string; color: string; value?: ReactNode };

export type ChartContainerProps = {
  title: ReactNode;
  description?: ReactNode;
  metric?: ReactNode;
  change?: number;
  changeLabel?: string;
  actions?: ReactNode;
  legend?: ChartLegendItem[];
  height?: number;
  loading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export function ChartContainer({
  title,
  description,
  metric,
  change,
  changeLabel = "vs previous period",
  actions,
  legend,
  height = 280,
  loading = false,
  isEmpty = false,
  emptyMessage = "No data for the selected period.",
  footer,
  className,
  children,
}: ChartContainerProps) {
  const positive = (change ?? 0) >= 0;
  const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4 px-5 pt-5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-medium text-muted">{title}</h3>
          {metric !== undefined && (
            <div className="mt-1.5 flex items-baseline gap-2.5">
              <span className="text-metric text-2xl font-semibold text-ink">{metric}</span>
              {change !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 font-mono text-xs font-medium tabular-nums",
                    positive ? "text-success" : "text-danger",
                  )}
                >
                  <TrendIcon className="size-3.5" />
                  {formatPercent(change)}
                  <span className="ml-1 font-sans font-normal text-subtle">{changeLabel}</span>
                </span>
              )}
            </div>
          )}
          {description && <p className="mt-1 text-[13px] text-muted">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {legend && legend.length > 0 && (
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 px-5 pt-4">
          {legend.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-xs text-muted">
              <span className="size-2 rounded-sm" style={{ backgroundColor: item.color }} aria-hidden />
              {item.label}
              {item.value !== undefined && (
                <span className="font-mono font-medium tabular-nums text-ink">{item.value}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="relative px-5 pb-5 pt-4" style={{ height }}>
        {loading ? (
          <div className="flex h-full items-end gap-2">
            {[40, 65, 50, 80, 60, 90, 70, 85, 55, 75, 95, 68].map((h, i) => (
              <Skeleton key={i} className="flex-1 rounded-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState
            icon={<BarChart3 />}
            title="Nothing to show yet"
            description={emptyMessage}
            className="h-full py-0"
          />
        ) : (
          children
        )}
      </div>

      {footer && <div className="border-t border-border px-5 py-3 text-[13px] text-muted">{footer}</div>}
    </Card>
  );
}
