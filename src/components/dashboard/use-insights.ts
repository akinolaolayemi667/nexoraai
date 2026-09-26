import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useToast } from "@/components/ui";
import { insights, type Insight } from "./dashboard-data";

export type ActionStatus = "idle" | "running" | "done";

export function useInsights(onScrollTo: (target: string) => void) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [status, setStatus] = useState<Record<string, ActionStatus>>({});
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const restore = useCallback((id: string) => setDismissed((current) => current.filter((d) => d !== id)), []);
  const restoreAll = useCallback(() => setDismissed([]), []);

  const dismiss = useCallback(
    (insight: Insight) => {
      setDismissed((current) => [...current, insight.id]);
      toast({ title: "Insight dismissed", action: { label: "Undo", onClick: () => restore(insight.id) } });
    },
    [toast, restore],
  );

  function run(insight: Insight) {
    const { action } = insight;
    if (action.type === "navigate") {
      navigate(action.href);
      return;
    }
    if (action.type === "scroll") {
      onScrollTo(action.target);
      return;
    }
    if (status[insight.id]) return;
    setStatus((current) => ({ ...current, [insight.id]: "running" }));
    timers.current.push(
      window.setTimeout(() => {
        setStatus((current) => ({ ...current, [insight.id]: "done" }));
        toast({ variant: "success", title: action.doneLabel, description: "Saved to AI Assistant for your review." });
      }, 1200),
    );
  }

  return {
    active: insights.filter((insight) => !dismissed.includes(insight.id)),
    dismissedCount: dismissed.length,
    status,
    run,
    dismiss,
    restoreAll,
  };
}
