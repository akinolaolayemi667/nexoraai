import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, CheckCircle2, Loader2, RefreshCw, RotateCcw, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { transitions } from "@/lib/motion";
import { Badge, Button, Card, Drawer, Skeleton, Tabs, Tooltip } from "@/components/ui";
import type { Insight, InsightCategory, InsightKind } from "./dashboard-data";
import type { ActionStatus } from "./use-insights";

const kindStyles: Record<InsightKind, string> = {
  action: "bg-primary-soft text-primary",
  risk: "bg-warning-soft text-warning-text",
  opportunity: "bg-success-soft text-success-text",
};

const priorityBadge = {
  high: { variant: "danger", label: "High priority" },
  medium: { variant: "warning", label: "Medium" },
  low: { variant: "neutral", label: "Low" },
} as const;

type InsightHandlers = {
  status: Record<string, ActionStatus>;
  onRun: (insight: Insight) => void;
  onDismiss: (insight: Insight) => void;
};

function InsightIcon({ insight, className }: { insight: Insight; className?: string }) {
  return (
    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md", kindStyles[insight.kind], className)}>
      <insight.icon className="size-4" aria-hidden />
    </span>
  );
}

function ActionLink({ insight, status, onRun }: { insight: Insight; status: ActionStatus; onRun: () => void }) {
  const { action } = insight;
  if (action.type === "run" && status !== "idle") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium",
          status === "done" ? "text-success-text" : "text-muted",
        )}
        role="status"
      >
        {status === "done" ? <Check className="size-3.5" aria-hidden /> : <Loader2 className="size-3.5 animate-spin" aria-hidden />}
        {status === "done" ? action.doneLabel : action.runningLabel}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onRun}
      className="inline-flex items-center gap-1 rounded-xs text-xs font-medium text-primary outline-none transition-colors hover:text-primary-active focus-visible:shadow-focus"
    >
      {action.label}
      <ArrowRight className="size-3 transition-transform duration-150 group-hover/insight:translate-x-0.5" aria-hidden />
    </button>
  );
}

export function AiInsightsCard({
  className,
  insights,
  status,
  onRun,
  onDismiss,
  onViewAll,
}: InsightHandlers & {
  className?: string;
  insights: Insight[];
  onViewAll: () => void;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [updated, setUpdated] = useState("Updated 4 min ago");
  const visible = insights.slice(0, 3);

  useEffect(() => {
    if (!refreshing) return;
    const timer = window.setTimeout(() => {
      setRefreshing(false);
      setUpdated("Updated just now");
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [refreshing]);

  return (
    <Card variant="ai" className={cn("relative flex flex-col overflow-hidden", className)}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-accent/8 to-transparent"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3 px-5 pt-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent bg-gradient-ai text-white shadow-xs">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="type-h3 flex items-center gap-2">
              AI Insights
              {insights.length > 0 && (
                <Badge variant="accent" className="font-mono">
                  {insights.length} new
                </Badge>
              )}
            </h2>
            <p className="text-xs text-muted" aria-live="polite">
              {refreshing ? "Analyzing your workspace…" : updated}
            </p>
          </div>
        </div>
        <Tooltip content="Refresh insights" side="left">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setRefreshing(true)}
            disabled={refreshing}
            aria-label="Refresh insights"
          >
            <RefreshCw className={cn(refreshing && "animate-spin")} />
          </Button>
        </Tooltip>
      </div>

      <div className="relative mt-3 flex-1 px-2">
        {refreshing ? (
          <div className="space-y-1 px-3 py-2" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3 py-2.5">
                <Skeleton className="size-8 shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-11/12" />
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-success-soft text-success-text">
              <CheckCircle2 className="size-5" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-medium text-ink">You're all caught up</p>
            <p className="mt-0.5 text-xs text-muted">New insights appear as your data changes.</p>
          </div>
        ) : (
          <ul>
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((insight) => (
                <motion.li
                  key={insight.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: transitions.emphasized }}
                  exit={{ opacity: 0, x: 16, transition: transitions.exit }}
                  className="group/insight relative flex gap-3 rounded-lg px-3 py-3 transition-colors duration-150 hover:bg-white/70"
                >
                  <InsightIcon insight={insight} />
                  <div className="min-w-0 flex-1 pr-5">
                    <p className="text-sm font-medium leading-snug text-ink">{insight.title}</p>
                    <div className="mt-1.5">
                      <ActionLink insight={insight} status={status[insight.id] ?? "idle"} onRun={() => onRun(insight)} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDismiss(insight)}
                    className="absolute right-2 top-2.5 rounded-sm p-1 text-subtle opacity-100 outline-none transition-[opacity,color] duration-150 hover:text-ink focus-visible:opacity-100 focus-visible:shadow-focus sm:opacity-0 sm:group-hover/insight:opacity-100"
                    aria-label={`Dismiss insight: ${insight.title}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <div className="relative border-t border-accent/10 p-3">
        <Button variant="secondary" size="sm" className="w-full" rightIcon={<ArrowRight />} onClick={onViewAll}>
          View insights
        </Button>
      </div>
    </Card>
  );
}

type Filter = "all" | InsightCategory;
const categories: InsightCategory[] = ["Leads", "Pipeline", "Marketing"];

export function InsightsDrawer({
  open,
  onClose,
  insights,
  dismissedCount,
  status,
  onRun,
  onDismiss,
  onRestore,
}: InsightHandlers & {
  open: boolean;
  onClose: () => void;
  insights: Insight[];
  dismissedCount: number;
  onRestore: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = filter === "all" ? insights : insights.filter((insight) => insight.category === filter);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <span className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-accent bg-gradient-ai text-white">
            <Sparkles className="size-3.5" aria-hidden />
          </span>
          AI insights
        </span>
      }
      description="Recommendations generated from the last 30 days of leads, deals and conversations."
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {dismissedCount > 0 ? `${dismissedCount} dismissed` : "Insights refresh every hour."}
          </p>
          {dismissedCount > 0 ? (
            <Button variant="ghost" size="sm" leftIcon={<RotateCcw />} onClick={onRestore}>
              Restore dismissed
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      }
    >
      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as Filter)}
        items={[
          { value: "all", label: "All", count: insights.length },
          ...categories.map((category) => ({
            value: category,
            label: category,
            count: insights.filter((insight) => insight.category === category).length,
          })),
        ]}
      />

      <ul className="mt-5 flex flex-col gap-3">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((insight) => {
            const actionStatus = status[insight.id] ?? "idle";
            const { action } = insight;
            const priority = priorityBadge[insight.priority];
            return (
              <motion.li
                key={insight.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: transitions.emphasized }}
                exit={{ opacity: 0, scale: 0.98, transition: transitions.exit }}
                className="glass-card rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <InsightIcon insight={insight} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={priority.variant} dot>
                        {priority.label}
                      </Badge>
                      <Badge>{insight.category}</Badge>
                    </div>
                    <h3 className="type-h4 mt-2 leading-snug">{insight.title}</h3>
                    <p className="mt-1 text-sm text-muted">{insight.detail}</p>
                    <p className="mt-3 inline-flex rounded-sm bg-canvas px-2 py-1 font-mono text-2xs font-medium text-ink ring-1 ring-border">
                      {insight.impact}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant={action.type === "run" ? "primary" : "secondary"}
                        rightIcon={action.type === "run" ? undefined : <ArrowRight />}
                        loading={actionStatus === "running"}
                        loadingText={action.type === "run" ? action.runningLabel : undefined}
                        success={actionStatus === "done"}
                        successText={action.type === "run" ? action.doneLabel : undefined}
                        onClick={() => {
                          if (action.type !== "run") onClose();
                          onRun(insight);
                        }}
                      >
                        {action.label}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDismiss(insight)}>
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
        {visible.length === 0 && (
          <li className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm font-medium text-ink">No open insights here</p>
            <p className="mt-0.5 text-xs text-muted">Dismissed insights can be restored from the footer.</p>
          </li>
        )}
      </ul>
    </Drawer>
  );
}
