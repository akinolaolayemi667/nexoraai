import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { fadeUp, motionStates } from "@/lib/motion";
import { Button } from "@/components/ui";
import { AppPanel, PanelHeader } from "./feature-layout";

type Prompt = {
  id: string;
  label: string;
  answer: string;
  facts?: [string, string][];
  action?: string;
};

const prompts: Prompt[] = [
  {
    id: "summary",
    label: "Summarize this week",
    answer:
      "Revenue is up 12% on last week, driven by three expansion deals. Lead volume dipped 4%, but conversion improved to 5.8%.",
    facts: [
      ["Closed won", "$84K"],
      ["New leads", "212"],
      ["Avg. first reply", "6 min"],
    ],
  },
  {
    id: "risk",
    label: "Which deals are at risk?",
    answer: "Two deals went quiet after receiving a proposal. Following up today gives the best chance of recovery.",
    facts: [
      ["Helio Energy", "$96K · 6 days"],
      ["Brightline", "$48K · 9 days"],
    ],
    action: "Draft follow-ups",
  },
  {
    id: "draft",
    label: "Draft a reply to Sofia",
    answer:
      "Hi Sofia, thanks for adding the new seats. I've put together an expansion plan for the operations team. Would a 20-minute walkthrough on Thursday work?",
    action: "Insert into email",
  },
];

type Phase = "thinking" | "streaming" | "done";

export function AiPreview() {
  const reduced = useReducedMotion();
  const [promptId, setPromptId] = useState(prompts[0].id);
  const [phase, setPhase] = useState<Phase>("done");
  const [chars, setChars] = useState(prompts[0].answer.length);
  const [actionDone, setActionDone] = useState(false);
  const timer = useRef<number>(undefined);

  const prompt = prompts.find((p) => p.id === promptId)!;

  useEffect(() => {
    window.clearInterval(timer.current);
    if (phase === "thinking") {
      timer.current = window.setTimeout(() => setPhase(reduced ? "done" : "streaming"), 650);
    } else if (phase === "streaming") {
      timer.current = window.setInterval(() => {
        setChars((c) => {
          const next = c + 4;
          if (next >= prompt.answer.length) {
            setPhase("done");
            return prompt.answer.length;
          }
          return next;
        });
      }, 16);
    }
    return () => {
      window.clearTimeout(timer.current);
      window.clearInterval(timer.current);
    };
  }, [phase, prompt.answer.length, reduced]);

  function ask(id: string) {
    if (phase !== "done" && id === promptId) return;
    setPromptId(id);
    setChars(reduced ? Number.MAX_SAFE_INTEGER : 0);
    setActionDone(false);
    setPhase("thinking");
  }

  const text = prompt.answer.slice(0, chars);

  return (
    <AppPanel label="Interactive AI assistant preview" className="flex flex-col">
      <PanelHeader
        title={
          <span className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-sm bg-accent text-white">
              <Sparkles className="size-3" aria-hidden />
            </span>
            NEXORA Assistant
          </span>
        }
      >
        <span className="text-2xs text-muted">Using live workspace data</span>
      </PanelHeader>

      <div className="flex min-h-72 flex-1 flex-col gap-3 p-3.5" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={prompt.id}
            variants={fadeUp}
            {...motionStates}
            className="ml-auto max-w-[85%] rounded-lg rounded-br-xs bg-primary px-3 py-2 text-sm text-white"
          >
            {prompt.label}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
            <Sparkles className="size-3.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 rounded-lg rounded-tl-xs border border-border bg-canvas/60 px-3 py-2.5">
            {phase === "thinking" ? (
              <span className="flex h-5 items-center gap-1" aria-label="Assistant is thinking">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 animate-pulse rounded-full bg-accent"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </span>
            ) : (
              <>
                <p className="text-sm text-ink">
                  {text}
                  {phase === "streaming" && <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-ink align-middle" />}
                </p>
                {phase === "done" && prompt.facts && (
                  <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2.5 flex flex-col gap-1">
                    {prompt.facts.map(([label, value]) => (
                      <li key={label} className="flex items-center justify-between gap-4 rounded-sm bg-white px-2 py-1 text-xs ring-1 ring-border">
                        <span className="font-medium text-ink">{label}</span>
                        <span className="font-mono text-muted">{value}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
                {phase === "done" && prompt.action && (
                  <Button
                    size="xs"
                    className="mt-3"
                    success={actionDone}
                    successText="Done"
                    onClick={() => setActionDone(true)}
                  >
                    {prompt.action}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border p-3">
        <p className="mb-2 text-2xs font-medium uppercase tracking-wider text-subtle">Try asking</p>
        <div className="flex flex-wrap gap-1.5">
          {prompts.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => ask(p.id)}
              aria-pressed={p.id === promptId}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium outline-none transition-colors focus-visible:shadow-focus",
                p.id === promptId
                  ? "border-accent-border bg-accent-soft text-accent-hover"
                  : "border-border bg-white text-ink hover:border-border-strong hover:bg-canvas",
              )}
            >
              {p.label}
              <ArrowUp className="size-3 rotate-45 opacity-60" aria-hidden />
            </button>
          ))}
        </div>
      </div>
    </AppPanel>
  );
}
