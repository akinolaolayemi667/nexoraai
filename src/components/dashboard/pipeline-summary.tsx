import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency, formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Card, Tabs, buttonVariants } from "@/components/ui";
import { pipelineStages } from "./dashboard-data";

type Mode = "value" | "deals";

const open = pipelineStages.filter((stage) => stage.id !== "won");
const won = pipelineStages.find((stage) => stage.id === "won")!;
const openValue = open.reduce((sum, stage) => sum + stage.value, 0);
const openDeals = open.reduce((sum, stage) => sum + stage.deals, 0);
const weighted = open.reduce((sum, stage) => sum + stage.value * stage.probability, 0);
const winRate = (won.deals / pipelineStages[0].deals) * 100;

export function PipelineSummary({ className }: { className?: string }) {
  const [mode, setMode] = useState<Mode>("value");
  const [hovered, setHovered] = useState<string | null>(null);
  const metric = (stage: (typeof pipelineStages)[number]) => (mode === "value" ? stage.value : stage.deals);
  const total = pipelineStages.reduce((sum, stage) => sum + metric(stage), 0);
  const max = Math.max(...pipelineStages.map(metric));

  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h2 className="type-h3">Pipeline summary</h2>
          <p className="mt-0.5 text-sm text-muted">
            {formatNumber(openDeals)} open deals across {open.length} stages.
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
          { label: "Win rate", value: `${winRate.toFixed(1)}%` },
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
          {pipelineStages.map((stage) => (
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
        {pipelineStages.map((stage, index) => {
          const next = pipelineStages[index + 1];
          const conversion = next ? Math.round((next.deals / stage.deals) * 100) : null;
          return (
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
                  {conversion !== null ? (
                    <span className="inline-flex items-center gap-1" title={`${conversion}% move on to ${next!.name}`}>
                      {conversion}%
                      <ArrowRight className="size-3 text-subtle" aria-hidden />
                    </span>
                  ) : (
                    <span className="text-success-text">closed</span>
                  )}
                </span>
                <ChevronRight
                  className="hidden size-4 text-subtle opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block"
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
        <p className="text-xs text-muted">
          <span className="hidden sm:inline">Percentages show how many deals move on to the next stage.</span>
          <span className="sm:hidden">
            Avg. deal <span className="font-mono text-ink">{formatCurrency(Math.round(openValue / openDeals))}</span>
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
