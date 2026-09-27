import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { fadeUp, motionStates } from "@/lib/motion";
import { Button } from "@/components/ui";
import { insights } from "./preview-data";

type Status = "idle" | "loading" | "done";

const ROTATE_MS = 8000;

export function AiInsights({ live }: { live: boolean }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const insight = insights[index];

  function go(next: number) {
    setIndex((next + insights.length) % insights.length);
    setStatus("idle");
  }

  useEffect(() => {
    if (!live || paused || status !== "idle") return;
    const timer = window.setTimeout(() => go(index + 1), ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [index, live, paused, status]);

  useEffect(() => {
    if (status !== "loading") return;
    const timer = window.setTimeout(() => setStatus("done"), 900);
    return () => window.clearTimeout(timer);
  }, [status]);

  return (
    <div
      className="glass-ai flex h-full flex-col rounded-xl p-4 shadow-none!"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-accent bg-gradient-ai text-white">
          <Sparkles className="size-3.5" aria-hidden />
        </span>
        <p className="whitespace-nowrap text-sm font-semibold text-ink">AI insights</p>
        <span className="inline-flex items-center gap-1 rounded-sm bg-white px-1.5 py-px text-2xs font-medium text-accent-hover ring-1 ring-accent-border">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden />
          Live
        </span>
        <div className="ml-auto flex items-center">
          <Button variant="ghost" size="icon-xs" onClick={() => go(index - 1)} aria-label="Previous insight">
            <ChevronLeft />
          </Button>
          <span className="w-8 text-center font-mono text-2xs text-muted">
            {index + 1}/{insights.length}
          </span>
          <Button variant="ghost" size="icon-xs" onClick={() => go(index + 1)} aria-label="Next insight">
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="relative mt-3 flex-1" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={index} variants={fadeUp} {...motionStates} className="flex h-full flex-col">
            <p className="text-sm font-semibold text-ink">{insight.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{insight.body}</p>
            <p className="mt-3 inline-flex self-start rounded-sm bg-white px-2 py-1 font-mono text-2xs font-medium text-accent-hover ring-1 ring-accent-border">
              {insight.impact}
            </p>
            <div className="mt-auto flex items-center gap-2 pt-4">
              <Button
                size="xs"
                loading={status === "loading"}
                loadingText="Working"
                success={status === "done"}
                successText="Done"
                onClick={() => setStatus("loading")}
              >
                {insight.action}
              </Button>
              <Button size="xs" variant="ghost" onClick={() => go(index + 1)}>
                Dismiss
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex gap-1" aria-hidden>
        {insights.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === index ? "w-5 bg-accent" : "w-1.5 bg-accent-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}
