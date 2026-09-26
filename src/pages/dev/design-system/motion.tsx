import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { duration, ease, motionStates, pageTransition } from "@/lib/motion";
import { Badge, Button, Card, FadeIn, Stagger, StaggerItem, type FadeInProps } from "@/components/ui";
import { DocBlock, DocSection, Specimen, Token } from "./doc";

const presets: { preset: NonNullable<FadeInProps["preset"]>; name: string; usage: string }[] = [
  { preset: "fadeIn", name: "fadeIn", usage: "Backdrops, tooltips, content swaps" },
  { preset: "fadeUp", name: "fadeUp", usage: "Cards and sections entering" },
  { preset: "scaleIn", name: "scaleIn", usage: "Modals, popovers, menus" },
  { preset: "slide-right", name: "slideIn('right')", usage: "Drawers, side panels" },
  { preset: "slide-left", name: "slideIn('left')", usage: "Mobile navigation" },
  { preset: "slide-up", name: "slideIn('up')", usage: "Toasts, bottom sheets" },
];

const durations = Object.entries(duration) as [keyof typeof duration, number][];
const easings = Object.entries(ease) as [keyof typeof ease, readonly number[]][];

export function MotionSection() {
  const [replay, setReplay] = useState(0);
  const [page, setPage] = useState(0);
  const reduced = useReducedMotion();
  const pages = ["Dashboard", "Pipeline", "Analytics"];

  return (
    <DocSection
      id="motion"
      eyebrow="Motion"
      title="Motion"
      description="Short, purposeful and interruptible. Everything under 400ms, with transforms removed automatically when the user prefers reduced motion."
    >
      <Specimen tone="canvas" className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <Badge variant={reduced ? "warning" : "success"} dot>
            {reduced ? "Reduced motion is ON" : "Full motion"}
          </Badge>
          <p className="type-body-sm">
            <Token>MotionConfig reducedMotion="user"</Token> keeps opacity fades but drops movement, and a CSS{" "}
            <Token>prefers-reduced-motion</Token> rule neutralises CSS transitions.
          </p>
        </div>
        <Button size="sm" variant="secondary" leftIcon={<RotateCcw />} onClick={() => setReplay((n) => n + 1)}>
          Replay all
        </Button>
      </Specimen>

      <DocBlock id="motion-presets" title="Presets" description="Variant objects in lib/motion.ts with hidden, visible and exit states, plus <FadeIn> and <Stagger> wrappers.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((p, i) => (
            <div key={p.preset} className="flex flex-col gap-2 overflow-hidden rounded-lg border border-border bg-canvas p-4">
              <FadeIn key={`${p.preset}-${replay}`} preset={p.preset} delay={i * 0.04}>
                <Card padding="sm" className="flex h-16 items-center justify-center">
                  <span className="font-mono text-xs text-ink">{p.name}</span>
                </Card>
              </FadeIn>
              <p className="text-2xs text-subtle">{p.usage}</p>
            </div>
          ))}
        </div>
      </DocBlock>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <DocBlock id="motion-stagger" title="staggerChildren" description="Lists reveal item by item, 40ms apart by default.">
          <Stagger key={`stagger-${replay}`} className="flex flex-col gap-2">
            {["Qualify inbound leads", "Draft follow-up emails", "Update deal stages", "Summarise calls"].map((task) => (
              <StaggerItem key={task}>
                <div className="flex items-center justify-between rounded-md border border-border bg-white px-4 py-3">
                  <span className="text-sm text-ink">{task}</span>
                  <Badge variant="accent">AI</Badge>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </DocBlock>

        <DocBlock id="motion-page" title="pageTransition" description="Applied to every /app route: a 6px rise with a fade.">
          <div className="overflow-hidden rounded-lg border border-border bg-canvas">
            <div className="flex gap-1 border-b border-border bg-white p-1.5">
              {pages.map((label, i) => (
                <Button key={label} size="xs" variant={page === i ? "secondary" : "ghost"} onClick={() => setPage(i)}>
                  {label}
                </Button>
              ))}
            </div>
            <div className="h-44 p-4">
              <AnimatePresence mode="wait">
                <motion.div key={page} variants={pageTransition} {...motionStates} className="flex h-full flex-col gap-3">
                  <p className="type-h4">{pages[page]}</p>
                  <div className="grid flex-1 grid-cols-3 gap-3">
                    {[0, 1, 2].map((n) => (
                      <div key={n} className="rounded-md border border-border bg-white" />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </DocBlock>
      </div>

      <DocBlock id="motion-tokens" title="Timing tokens">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Specimen label="Duration" className="p-0">
            <ul className="divide-y divide-border-subtle">
              {durations.map(([name, seconds]) => (
                <li key={name} className="flex items-center gap-4 px-5 py-3">
                  <Token>duration.{name}</Token>
                  <span className="h-1.5 flex-1 rounded-full bg-sunken">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${(seconds / 0.4) * 100}%` }} />
                  </span>
                  <span className="text-metric w-14 text-right text-xs text-ink">{Math.round(seconds * 1000)}ms</span>
                </li>
              ))}
            </ul>
          </Specimen>
          <Specimen label="Easing" className="p-0">
            <ul className="divide-y divide-border-subtle">
              {easings.map(([name, curve]) => (
                <li key={name} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div>
                    <Token>ease.{name}</Token>
                    <p className="mt-1 text-2xs text-subtle">
                      {name === "standard" && "Most UI transitions"}
                      {name === "emphasized" && "Entrances — fast start, soft landing"}
                      {name === "exit" && "Exits — accelerate away"}
                    </p>
                  </div>
                  <span className="font-mono text-2xs text-muted">cubic-bezier({curve.join(", ")})</span>
                </li>
              ))}
            </ul>
          </Specimen>
        </div>
      </DocBlock>
    </DocSection>
  );
}
