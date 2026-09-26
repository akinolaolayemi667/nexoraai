import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency, formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useCrm } from "@/lib/crm/crm-context";
import { Card, Tabs, buttonVariants } from "@/components/ui";
import { summarizePipeline, type PipelineStage } from "./dashboard-data";

type Mode = "value" | "deals";

export function PipelineSummary({ className }: { className?: string }) {
  const { state } = useCrm();
  const [mode, setMode] = useState<Mode>("value");
  const [hovered, setHovered] = useState<string | null>(null);
  const { stages, openValue, openDeals, weighted, winRate } = useMemo(() => summarizePipeline(state.deals), [state.deals]);
  const metric = (stage: PipelineStage) => (mode === "value" ? stage.value : stage.deals);
  const total = stages.reduce((sum, stage) => sum + metric(stage), 0) || 1;
  const max = Math.max(1, ...stages.map(metric));

  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h2 className="type-h3">Pipeline summary</h2>
          <p className="mt-0.5 text-sm text-muted">
            {formatNumber(openDeals)} open deals across {stages.length - 1} stages.
          </p>
        </div>
        <Tabs
          variant="segmented"
          value={mode}
          onValueChange={(value) => setMode(value as Mode)}
          items={[
            { value: "value", label: "Value" },
            { value: "deals", label: "Deals" },
          ]}
        />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-4 px-5">
        {[
          { label: "Open pipeline", value: formatCurrency(openValue) },
          {
            label: (
              <>
                <span className="sm:hidden">Forecast</span>
                <span className="hidden sm:inline">Weighted forecast</span>
              </>
            ),
            value: formatCurrency(Math.round(weighted)),
          },
          { label: "Win rate", value: `${winRate.toFixed(0)}%` },
        ].map((stat, index) => (
          <div key={index} className="min-w-0">
            <dt className="truncate text-xs text-muted">{stat.label}</dt>
            <dd className="mt-0.5 truncate font-mono text-base font-semibold tabular-nums tracking-tight text-ink sm:text-lg">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 px-5" aria-hidden>
        <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
          {stages.map((stage) => (
            <span
              key={stage.id}
              className={cn(
                "h-full basis-0 transition-[flex-grow,opacity] duration-500 ease-emphasized",
                hovered && hovered !== stage.id && "opacity-30",
              )}
              style={{ flexGrow: metric(stage) / total, backgroundColor: stage.color }}
            />
          ))}
        </div>
      </div>

      <ul className="mt-3 flex-1 px-2 pb-2">
        {stages.map((stage) => (
          <li key={stage.id}>
            <Link
              to={`${routes.app.pipeline}?stage=${stage.id}`}
              onPointerEnter={() => setHovered(stage.id)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(stage.id)}
              onBlur={() => setHovered(null)}
              className="group grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 rounded-md px-3 py-2 outline-none transition-colors duration-100 hover:bg-canvas focus-visible:bg-canvas focus-visible:shadow-focus sm:grid-cols-[7.5rem_1fr_5.5rem_4.5rem_1rem]"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: stage.color }} aria-hidden />
                <span className="truncate text-sm font-medium text-ink">{stage.name}</span>
              </span>
              <span className="h-1.5 overflow-hidden rounded-full bg-sunken">
                <span
                  className="block h-full rounded-full transition-[width] duration-500 ease-emphasized"
                  style={{ width: `${(metric(stage) / max) * 100}%`, backgroundColor: stage.color }}
                />
              </span>
              <span className="text-right">
                <span className="block font-mono text-sm font-medium tabular-nums text-ink">
                  {mode === "value" ? formatCurrency(stage.value) : `${stage.deals} deals`}
                </span>
                <span className="block font-mono text-2xs tabular-nums text-subtle sm:hidden">
                  {mode === "value" ? `${stage.deals} deals` : formatCurrency(stage.value)}
                </span>
              </span>
              <span className="hidden text-right font-mono text-xs tabular-nums text-muted sm:block">
                {stage.id === "won" ? (
                  <span className="text-success-text">closed</span>
                ) : (
                  <span title={`Average win probability in ${stage.name}`}>{stage.probability}%</span>
                )}
              </span>
              <ChevronRight
                className="hidden size-4 text-subtle opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
        <p className="text-xs text-muted">
          <span className="hidden sm:inline">Percentages show the average win probability in each stage.</span>
          <span className="sm:hidden">
            Avg. deal{" "}
            <span className="font-mono text-ink">{formatCurrency(openDeals > 0 ? Math.round(openValue / openDeals) : 0)}</span>
          </span>
        </p>
        <Link to={routes.app.pipeline} className={buttonVariants({ variant: "ghost", size: "xs", className: "-mr-2" })}>
          Open pipeline
          <ArrowRight />
        </Link>
      </div>
    </Card>
  );
}
