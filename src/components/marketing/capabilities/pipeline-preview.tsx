import { useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCompact } from "@/lib/format";
import { transitions } from "@/lib/motion";
import { chartColor } from "@/lib/tokens";
import { Avatar, Button } from "@/components/ui";
import { AppPanel, PanelHeader } from "./feature-layout";

const stages = [
  { name: "Qualified", probability: 0.25, color: chartColor(0) },
  { name: "Proposal", probability: 0.6, color: chartColor(1) },
  { name: "Won", probability: 1, color: chartColor(3) },
];

type Deal = { id: string; company: string; value: number; owner: string; stage: number };

const initialDeals: Deal[] = [
  { id: "d1", company: "Kestrel Studio", value: 18000, owner: "Priya Shah", stage: 0 },
  { id: "d2", company: "Aurora Retail", value: 22000, owner: "Olayemi Akinola", stage: 0 },
  { id: "d3", company: "Northwind Health", value: 36000, owner: "Priya Shah", stage: 1 },
  { id: "d4", company: "Brightline", value: 48000, owner: "Olayemi Akinola", stage: 1 },
  { id: "d5", company: "Stackfield", value: 31000, owner: "Leo Grant", stage: 2 },
];

export function PipelinePreview() {
  const reduced = useReducedMotion();
  const [deals, setDeals] = useState(initialDeals);
  const changed = deals.some((d, i) => d.stage !== initialDeals[i].stage);

  const forecast = deals.reduce((sum, d) => sum + d.value * stages[d.stage].probability, 0);
  const won = deals.filter((d) => d.stage === 2).reduce((sum, d) => sum + d.value, 0);

  function advance(id: string) {
    setDeals((list) => list.map((d) => (d.id === id ? { ...d, stage: Math.min(d.stage + 1, 2) } : d)));
  }

  return (
    <AppPanel label="Interactive sales pipeline preview" className="flex flex-col">
      <PanelHeader title="Q4 pipeline">
        {changed && (
          <Button size="xs" variant="ghost" leftIcon={<RotateCcw />} onClick={() => setDeals(initialDeals)}>
            Reset
          </Button>
        )}
      </PanelHeader>
      <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
        <div className="px-3.5 py-2.5">
          <p className="text-2xs text-muted">Weighted forecast</p>
          <p className="text-metric text-base font-semibold text-ink">${formatCompact(forecast)}</p>
        </div>
        <div className="px-3.5 py-2.5">
          <p className="text-2xs text-muted">Closed won</p>
          <p className="text-metric text-base font-semibold text-success-text">${formatCompact(won)}</p>
        </div>
      </div>
      <LayoutGroup>
        <div className="grid flex-1 grid-cols-3 gap-2 p-2.5">
          {stages.map((stage, si) => {
            const column = deals.filter((d) => d.stage === si);
            const total = column.reduce((sum, d) => sum + d.value, 0);
            return (
              <section key={stage.name} aria-label={`${stage.name} stage`} className="flex min-w-0 flex-col rounded-md bg-canvas p-1.5">
                <header className="flex items-center gap-1.5 px-1 pb-2 pt-0.5">
                  <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="truncate text-xs font-medium text-ink">{stage.name}</span>
                  <span className="ml-auto font-mono text-2xs text-subtle">{column.length}</span>
                </header>
                <p className="px-1 pb-2 font-mono text-2xs text-muted">${formatCompact(total)}</p>
                <div className="flex min-h-40 flex-col gap-1.5">
                  {column.map((deal) => (
                    <motion.div
                      key={deal.id}
                      layoutId={reduced ? undefined : deal.id}
                      transition={transitions.spring}
                      className={cn(
                        "rounded-md border bg-white p-2 shadow-xs",
                        si === 2 ? "border-success-border" : "border-border",
                      )}
                    >
                      <p className="truncate text-xs font-medium text-ink">{deal.company}</p>
                      <p className="text-metric text-2xs text-muted">${formatCompact(deal.value)}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <Avatar name={deal.owner} size="xs" />
                        {si < 2 ? (
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            aria-label={`Move ${deal.company} to ${stages[si + 1].name}`}
                            onClick={() => advance(deal.id)}
                          >
                            <ArrowRight />
                          </Button>
                        ) : (
                          <Trophy className="size-3.5 text-success" aria-label="Won" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </LayoutGroup>
    </AppPanel>
  );
}
