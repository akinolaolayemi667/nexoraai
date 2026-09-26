import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, GitBranch, Loader2, Mail, Play, Sparkles, UserPlus, Zap, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { Badge, Button } from "@/components/ui";
import { AppPanel, PanelHeader } from "./feature-layout";

type Step = { icon: LucideIcon; kind: string; label: string; tone: string; log: string };

const steps: Step[] = [
  {
    icon: Zap,
    kind: "Trigger",
    label: "New lead from website form",
    tone: "bg-primary-soft text-primary-active",
    log: "Lead received: Chloe Martin, Aurora Retail",
  },
  {
    icon: Sparkles,
    kind: "AI step",
    label: "Enrich and score the lead",
    tone: "bg-accent-soft text-accent-hover",
    log: "Scored 86 · Retail · 120 employees",
  },
  {
    icon: GitBranch,
    kind: "Condition",
    label: "Score is 80 or higher",
    tone: "bg-warning-soft text-warning-text",
    log: "Condition met, taking the Yes branch",
  },
  {
    icon: UserPlus,
    kind: "Action",
    label: "Assign to an account executive",
    tone: "bg-success-soft text-success-text",
    log: "Assigned to Olayemi Akinola (round robin)",
  },
  {
    icon: Mail,
    kind: "Action",
    label: "Send personalised welcome email",
    tone: "bg-sky-50 text-sky-700",
    log: "Email sent from olayemi@nexora.ai",
  },
];

const STEP_MS = 650;

type RunState = "idle" | "running" | "done";

function clock(offset: number) {
  const d = new Date(Date.now() + offset);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function AutomationPreview() {
  const [active, setActive] = useState(true);
  const [run, setRun] = useState<RunState>("idle");
  const [progress, setProgress] = useState(-1);
  const [log, setLog] = useState<{ id: number; time: string; text: string }[]>([]);
  const [runsToday, setRunsToday] = useState(148);
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function advance(index: number) {
    setProgress(index);
    if (index > 0) {
      const step = steps[index - 1];
      setLog((entries) => [...entries, { id: index, time: clock(0), text: step.log }]);
    }
    if (index === steps.length) {
      setRun("done");
      setRunsToday((n) => n + 1);
      return;
    }
    timer.current = window.setTimeout(() => advance(index + 1), STEP_MS);
  }

  function runTest() {
    window.clearTimeout(timer.current);
    setLog([]);
    setRun("running");
    advance(0);
  }

  function status(i: number) {
    if (run === "idle") return "idle";
    if (i < progress) return "done";
    if (i === progress && run === "running") return "running";
    return "idle";
  }

  return (
    <AppPanel label="Interactive automation builder preview">
      <PanelHeader
        title={
          <span className="flex items-center gap-2">
            Inbound lead routing
            <Badge variant={active ? "success" : "neutral"} size="sm" dot>
              {active ? "Active" : "Paused"}
            </Badge>
          </span>
        }
      >
        <button
          type="button"
          role="switch"
          aria-checked={active}
          aria-label="Workflow active"
          onClick={() => setActive((a) => !a)}
          className={cn(
            "relative h-5 w-9 rounded-full outline-none transition-colors focus-visible:shadow-focus",
            active ? "bg-success" : "bg-border-strong",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-[left] duration-150",
              active ? "left-[1.125rem]" : "left-0.5",
            )}
          />
        </button>
        <Button
          size="xs"
          variant={run === "done" ? "secondary" : "primary"}
          leftIcon={<Play />}
          loading={run === "running"}
          loadingText="Running"
          onClick={runTest}
        >
          {run === "done" ? "Run again" : "Run test"}
        </Button>
      </PanelHeader>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_14rem]">
        <ol className="flex flex-col p-4">
          {steps.map((step, i) => {
            const s = status(i);
            const Icon = step.icon;
            return (
              <li key={step.label} className="flex flex-col">
                {i > 0 && (
                  <span
                    className={cn(
                      "ml-[1.375rem] h-3 w-px transition-colors duration-300",
                      s !== "idle" || (run !== "idle" && i <= progress) ? "bg-primary" : "bg-border-strong",
                    )}
                    aria-hidden
                  />
                )}
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-md border bg-white px-3 py-2 transition-[border-color,box-shadow] duration-300",
                    s === "running" ? "border-primary shadow-focus" : s === "done" ? "border-success-border" : "border-border",
                    !active && "opacity-60",
                  )}
                >
                  <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-sm", step.tone)}>
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-2xs font-medium uppercase tracking-wider text-subtle">{step.kind}</span>
                    <span className="block truncate text-xs font-medium text-ink">{step.label}</span>
                  </span>
                  <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden>
                    {s === "running" && <Loader2 className="size-3.5 animate-spin text-primary" />}
                    {s === "done" && <Check className="size-3.5 text-success" />}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-col border-t border-border bg-canvas/50 sm:border-l sm:border-t-0">
          <div className="grid grid-cols-2 border-b border-border">
            <div className="px-3.5 py-2.5">
              <p className="text-2xs text-muted">Runs today</p>
              <p className="text-metric text-sm font-semibold text-ink">{formatNumber(runsToday)}</p>
            </div>
            <div className="border-l border-border px-3.5 py-2.5">
              <p className="text-2xs text-muted">Success rate</p>
              <p className="text-metric text-sm font-semibold text-ink">99.3%</p>
            </div>
          </div>
          <p className="px-3.5 pt-3 text-2xs font-medium uppercase tracking-wider text-subtle">Run log</p>
          <ol className="flex min-h-40 flex-1 flex-col gap-1.5 px-3.5 py-2.5" aria-live="polite">
            {log.length === 0 && run === "idle" && (
              <li className="text-xs text-muted">Run a test to watch each step execute.</li>
            )}
            <AnimatePresence initial={false}>
              {log.map((entry) => (
                <motion.li
                  key={entry.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2 text-2xs"
                >
                  <span className="shrink-0 font-mono text-subtle">{entry.time}</span>
                  <span className="text-ink">{entry.text}</span>
                </motion.li>
              ))}
            </AnimatePresence>
            {run === "done" && (
              <li className="mt-1 flex items-center gap-1.5 text-xs font-medium text-success-text">
                <Check className="size-3.5" aria-hidden />
                Completed in {((steps.length * STEP_MS) / 1000).toFixed(1)}s
              </li>
            )}
          </ol>
        </div>
      </div>
    </AppPanel>
  );
}
