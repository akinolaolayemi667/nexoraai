import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatNumber, formatPercent } from "@/lib/format";
import { AreaChart, Card, Tabs, type ChartSeries } from "@/components/ui";
import { leadSeries, periods, type LeadPoint, type Period } from "./dashboard-data";

type SeriesKey = "leads" | "qualified" | "converted";

const allSeries: (ChartSeries<SeriesKey> & { description: (totals: Record<SeriesKey, number>) => string })[] = [
  { key: "leads", label: "Leads", color: "var(--color-chart-1)", description: () => "All new leads" },
  {
    key: "qualified",
    label: "Qualified",
    color: "var(--color-chart-4)",
    description: (t) => `${((t.qualified / t.leads) * 100).toFixed(1)}% of leads`,
  },
  {
    key: "converted",
    label: "Converted",
    color: "var(--color-chart-5)",
    description: (t) => `${((t.converted / t.leads) * 100).toFixed(1)}% of leads`,
  },
];

export function LeadPerformance({ className }: { className?: string }) {
  const [period, setPeriod] = useState<Period>("30d");
  const [hidden, setHidden] = useState<SeriesKey[]>([]);
  const config = periods[period];
  const data = useMemo(() => leadSeries(period), [period]);
  const series = allSeries.filter((s) => !hidden.includes(s.key));
  const conversion = (config.totals.converted / config.totals.leads) * 100;

  function toggle(key: SeriesKey) {
    setHidden((current) => {
      if (current.includes(key)) return current.filter((k) => k !== key);
      if (current.length === allSeries.length - 1) return current;
      return [...current, key];
    });
  }

  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h2 className="type-h3">Lead performance</h2>
          <p className="mt-0.5 text-sm text-muted">How leads move from first touch to customer.</p>
        </div>
        <Tabs
          variant="segmented"
          value={period}
          onValueChange={(value) => setPeriod(value as Period)}
          items={(Object.keys(periods) as Period[]).map((key) => ({ value: key, label: periods[key].label }))}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5 px-5 sm:gap-2" role="group" aria-label="Toggle chart series">
        {allSeries.map((s) => {
          const active = !hidden.includes(s.key);
          return (
            <button
              key={s.key}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(s.key)}
              className={cn(
                "min-w-0 rounded-md border px-2.5 py-2.5 text-left outline-none sm:px-3 transition-[border-color,background-color,opacity] duration-150 focus-visible:shadow-focus",
                active ? "border-border bg-white hover:border-border-strong" : "border-dashed border-border bg-canvas opacity-60 hover:opacity-80",
              )}
            >
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                <span
                  className="size-2 shrink-0 rounded-xs"
                  style={{ backgroundColor: active ? s.color : "var(--color-border-strong)" }}
                  aria-hidden
                />
                <span className="truncate">{s.label}</span>
              </span>
              <span className="mt-1 block font-mono text-lg font-semibold tabular-nums tracking-tight text-ink">
                {formatNumber(config.totals[s.key])}
              </span>
              <span className="hidden truncate text-2xs text-subtle sm:block">{s.description(config.totals)}</span>
            </button>
          );
        })}
      </div>

      <div className="h-64 px-3 pb-3 pt-4 sm:px-5">
        <AreaChart<LeadPoint>
          data={data}
          index="label"
          series={series}
          valueFormatter={formatNumber}
          showDots={period === "7d"}
          yAxisWidth={32}
          aria-label={`Lead performance, ${config.comparison.replace("vs previous", "last")}`}
        />
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border px-5 py-3 text-sm">
        <p className="text-muted">
          Lead-to-customer conversion{" "}
          <span className="font-mono font-medium tabular-nums text-ink">{conversion.toFixed(1)}%</span>
        </p>
        <p className="text-xs text-muted">
          <span className="inline-flex items-center gap-0.5 whitespace-nowrap font-mono font-medium text-success-text">
            <ArrowUpRight className="size-3.5" aria-hidden />
            {formatPercent(config.change)} leads
          </span>{" "}
          · +{config.conversionChange.toFixed(1)} pts conversion {config.comparison}
        </p>
      </div>
    </Card>
  );
}
