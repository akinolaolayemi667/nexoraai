import { useState } from "react";
import { ArrowRight, CheckCircle2, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { ownerIdFor, stageMeta } from "@/lib/crm/constants";
import { useCrm } from "@/lib/crm/crm-context";
import { aiSummary, dueLabel, nextStep, scoreBreakdown } from "@/lib/crm/insights";
import type { Activity, Deal, Lead, Task } from "@/lib/crm/types";
import { formatCurrency } from "@/lib/format";
import { Button, useToast } from "@/components/ui";
import { ActivityFeed } from "./activity-feed";

export type ProfileTab = "overview" | "activity" | "notes" | "tasks" | "conversations" | "deals";

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h3 className="type-h4">{title}</h3>
      {action}
    </div>
  );
}

function ViewAll({ onClick, label = "View all" }: { onClick: () => void; label?: string }) {
  return (
    <Button variant="ghost" size="xs" onClick={onClick} className="-mr-2" rightIcon={<ArrowRight />}>
      {label}
    </Button>
  );
}

export function OverviewTab({
  lead,
  openDeals,
  openTasks,
  timeline,
  now,
  onTab,
  onAddDeal,
}: {
  lead: Lead;
  openDeals: Deal[];
  openTasks: Task[];
  timeline: Activity[];
  now: number;
  onTab: (tab: ProfileTab) => void;
  onAddDeal: () => void;
}) {
  const { actions, actor } = useCrm();
  const { toast } = useToast();
  const [stepDone, setStepDone] = useState(false);
  const step = nextStep(lead, openDeals);
  const breakdown = scoreBreakdown(lead, now);

  function takeStep() {
    if (step.task.startsWith("Scope a deal")) {
      onAddDeal();
      return;
    }
    actions.addTask(lead.id, step.task, now + step.dueIn, ownerIdFor(actor));
    setStepDone(true);
    toast({ variant: "success", title: "Task created", description: step.task, action: { label: "View", onClick: () => onTab("tasks") } });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-primary-border bg-gradient-to-br from-primary-soft/50 via-white to-accent-soft/60 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-white">
            <Sparkles className="size-3.5" aria-hidden />
          </span>
          <h3 className="text-sm font-semibold text-ink">AI summary</h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink">{aiSummary(lead, openDeals, openTasks, now)}</p>
        <div className="mt-4 flex flex-col gap-3 rounded-md border border-border bg-white/80 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="type-overline">Suggested next step</p>
            <p className="mt-0.5 text-sm font-medium text-ink">{step.label}</p>
          </div>
          <Button
            size="sm"
            variant={stepDone ? "secondary" : "primary"}
            success={stepDone}
            successText="Task added"
            onClick={takeStep}
            disabled={stepDone}
            leftIcon={step.task.startsWith("Scope a deal") ? <Plus /> : <CheckCircle2 />}
          >
            {step.task.startsWith("Scope a deal") ? "Create deal" : "Create task"}
          </Button>
        </div>
      </section>

      <section>
        <SectionHeader title="Why this score" />
        <div className="grid gap-3 sm:grid-cols-2">
          {breakdown.map((factor) => (
            <div key={factor.id} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">{factor.label}</span>
                <span className="font-mono text-sm font-semibold tabular-nums text-ink">{factor.value}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sunken">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-700 ease-emphasized",
                    factor.value >= 80 ? "bg-success" : factor.value >= 60 ? "bg-primary" : factor.value >= 40 ? "bg-warning" : "bg-subtle",
                  )}
                  style={{ width: `${factor.value}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted">{factor.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <SectionHeader title="Upcoming tasks" action={<ViewAll onClick={() => onTab("tasks")} />} />
          {openTasks.length === 0 ? (
            <p className="rounded-md border border-dashed border-border-strong bg-canvas px-3 py-4 text-center text-sm text-muted">
              No open tasks.
            </p>
          ) : (
            <ul className="divide-y divide-border-subtle rounded-md border border-border">
              {openTasks.slice(0, 3).map((task) => {
                const due = dueLabel(task.dueAt, now);
                return (
                  <li key={task.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <span className="min-w-0 truncate text-sm text-ink">{task.title}</span>
                    <span
                      className={cn(
                        "shrink-0 font-mono text-2xs tabular-nums",
                        due.tone === "danger" ? "text-danger-text" : due.tone === "warning" ? "text-warning-text" : "text-muted",
                      )}
                    >
                      {due.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <SectionHeader title="Open deals" action={<ViewAll onClick={() => onTab("deals")} />} />
          {openDeals.length === 0 ? (
            <div className="rounded-md border border-dashed border-border-strong bg-canvas px-3 py-4 text-center">
              <p className="text-sm text-muted">No open deals.</p>
              <Button variant="link" className="mt-1 text-sm" onClick={onAddDeal}>
                Add a deal
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle rounded-md border border-border">
              {openDeals.slice(0, 3).map((deal) => (
                <li key={deal.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">{deal.name}</span>
                    <span className="flex items-center gap-1.5 text-xs text-muted">
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: stageMeta[deal.stage].color }} aria-hidden />
                      {stageMeta[deal.stage].label} · {deal.probability}%
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-sm font-medium tabular-nums text-ink">{formatCurrency(deal.value)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section>
        <SectionHeader title="Recent activity" action={<ViewAll onClick={() => onTab("activity")} label="Full timeline" />} />
        <ActivityFeed items={timeline.slice(0, 4)} now={now} grouped={false} />
      </section>
    </div>
  );
}
