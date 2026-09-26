import { useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ListChecks, ShieldAlert, Target, UserRound, Workflow } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency, formatRelative } from "@/lib/format";
import { transitions } from "@/lib/motion";
import { useCrm } from "@/lib/crm/crm-context";
import { followUpCandidates, overdueTasks, spotlightCustomer, staleDeals, waitingNewLeads } from "@/lib/ai/engine";

type Insight = {
  id: string;
  label: string;
  icon: ReactNode;
  tone: string;
  headline: string;
  detail: string;
  prompt: string;
};

export function InsightCards({ now, onAsk, disabled }: { now: number; onAsk: (prompt: string) => void; disabled?: boolean }) {
  const { state } = useCrm();

  const insights = useMemo<Insight[]>(() => {
    const hot = followUpCandidates(state, now);
    const stale = staleDeals(state, now);
    const spotlight = spotlightCustomer(state);
    const overdue = overdueTasks(state, now);
    const fresh = waitingNewLeads(state, now);
    return [
      {
        id: "leads",
        label: "Lead recommendations",
        icon: <Target />,
        tone: "bg-primary-soft/60 text-primary ring-primary-border",
        headline: hot.length ? `${hot.length} high-intent leads need follow-up` : "All hot leads are covered",
        detail: hot.length ? `Top picks: ${hot.slice(0, 2).map((l) => l.name).join(", ")}` : "Every lead scoring 80+ was contacted recently",
        prompt: "Which leads should I follow up with today?",
      },
      {
        id: "risks",
        label: "Pipeline risks",
        icon: <ShieldAlert />,
        tone: "bg-warning-soft text-warning-text ring-warning-border",
        headline: stale.length ? `${formatCurrency(stale.reduce((s, d) => s + d.value, 0))} has gone quiet` : "No stalled deals",
        detail: stale.length ? `${stale.length} deals idle for 7+ days, led by ${stale[0].company}` : "Every open deal moved this week",
        prompt: "Which deals are at risk?",
      },
      {
        id: "customer",
        label: "Customer summaries",
        icon: <UserRound />,
        tone: "bg-success-soft text-success-text ring-success-border",
        headline: spotlight ? `Brief me on ${spotlight.company}` : "Summarize a customer",
        detail: spotlight
          ? `${spotlight.lastActivity} ${formatRelative(spotlight.lastActivityAt, now).toLowerCase()}`
          : "Get the story on any account in seconds",
        prompt: spotlight ? `Summarize ${spotlight.company}` : "Summarize a customer",
      },
      {
        id: "actions",
        label: "Suggested actions",
        icon: <ListChecks />,
        tone: "bg-accent-soft text-accent ring-accent-border",
        headline: overdue.length ? `${overdue.length} overdue tasks to clear` : "Plan your day",
        detail: `${fresh.length} new ${fresh.length === 1 ? "lead" : "leads"} arrived this week`,
        prompt: "What should I do next?",
      },
      {
        id: "automation",
        label: "Automation suggestions",
        icon: <Workflow />,
        tone: "bg-sunken text-ink ring-border",
        headline: "Auto-qualify and route new leads",
        detail: "Could save your team about 6 hours a week",
        prompt: "What should I automate next?",
      },
    ];
  }, [state, now]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {insights.map((insight, i) => (
        <motion.button
          key={insight.id}
          type="button"
          disabled={disabled}
          onClick={() => onAsk(insight.prompt)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transitions.spring, delay: 0.04 * i }}
          className={cn(
            "group flex flex-col rounded-xl border border-border bg-white p-4 text-left shadow-xs outline-none transition-[border-color,box-shadow,transform] duration-150",
            "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md focus-visible:border-primary focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-60",
            i === 0 && "sm:col-span-2",
            i < 2 ? "lg:col-span-3" : "lg:col-span-2",
          )}
        >
          <span className="flex items-center gap-2">
            <span className={cn("flex size-7 items-center justify-center rounded-md ring-1 ring-inset [&_svg]:size-3.5", insight.tone)}>
              {insight.icon}
            </span>
            <span className="type-overline text-muted">{insight.label}</span>
          </span>
          <span className="mt-3 text-sm font-semibold text-ink">{insight.headline}</span>
          <span className="mt-1 line-clamp-2 text-xs text-muted">{insight.detail}</span>
          <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-medium text-primary">
            Ask Nexora AI
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </motion.button>
      ))}
    </div>
  );
}
