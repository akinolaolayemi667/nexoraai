import { Link } from "react-router";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";
import { AnimatedNumber, Sparkline } from "@/components/ui";
import { metrics, type Metric } from "./dashboard-data";

function MetricTile({ metric }: { metric: Metric }) {
  const up = metric.change >= 0;
  const TrendIcon = up ? ArrowUpRight : ArrowDownRight;

  return (
    <Link
      to={metric.href}
      className="group flex min-w-0 flex-col rounded-lg border border-border bg-white p-4 shadow-sm outline-none transition-[border-color,box-shadow] duration-150 hover:border-border-strong hover:shadow-md focus-visible:border-primary focus-visible:shadow-focus sm:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-muted">{metric.label}</span>
        <span className="hidden size-7 shrink-0 items-center justify-center rounded-md bg-canvas text-subtle ring-1 ring-border transition-colors duration-150 group-hover:text-primary sm:flex">
          <metric.icon className="size-3.5" aria-hidden />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <AnimatedNumber
            value={metric.value}
            format={(v) => metric.format(Math.round(v))}
            className="block truncate font-mono text-xl font-semibold tabular-nums tracking-tight text-ink sm:text-2xl"
          />
          <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-sm px-1 py-px font-mono font-medium tabular-nums",
                up ? "bg-success-soft text-success-text" : "bg-danger-soft text-danger-text",
              )}
            >
              <TrendIcon className="size-3" aria-hidden />
              {formatPercent(metric.change)}
            </span>
            <span className="text-subtle">vs last month</span>
          </p>
        </div>
        <Sparkline
          data={metric.trend}
          color={up ? "var(--color-chart-1)" : "var(--color-danger)"}
          className="hidden h-9 w-20 shrink-0 sm:block"
        />
      </div>
    </Link>
  );
}

export function MetricCards() {
  return (
    <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricTile key={metric.id} metric={metric} />
      ))}
    </section>
  );
}
