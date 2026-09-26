import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { duration, ease } from "@/lib/motion";

type Side = "top" | "bottom" | "left" | "right";

const positions: Record<Side, string> = {
  top: "bottom-full left-1/2 mb-1.5 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-1.5 -translate-x-1/2",
  left: "right-full top-1/2 mr-1.5 -translate-y-1/2",
  right: "left-full top-1/2 ml-1.5 -translate-y-1/2",
};

const offsets: Record<Side, { x?: number; y?: number }> = {
  top: { y: 2 },
  bottom: { y: -2 },
  left: { x: 2 },
  right: { x: -2 },
};

export type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  side?: Side;
  delay?: number;
  shortcut?: string;
  disabled?: boolean;
  className?: string;
};

export function Tooltip({
  content,
  children,
  side = "top",
  delay = 300,
  shortcut,
  disabled = false,
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const id = useId();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function show() {
    if (disabled) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delay);
  }

  function hide() {
    window.clearTimeout(timer.current);
    setOpen(false);
  }

  return (
    <span
      className={cn("relative inline-flex", className)}
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(event) => event.key === "Escape" && hide()}
      aria-describedby={open ? id : undefined}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, ...offsets[side] }}
            animate={{ opacity: 1, x: 0, y: 0, transition: { duration: duration.fast, ease: ease.standard } }}
            exit={{ opacity: 0, transition: { duration: duration.instant } }}
            className={cn(
              "pointer-events-none absolute z-50 flex w-max max-w-xs items-center gap-2 rounded-md bg-ink px-2 py-1 text-xs font-medium text-white shadow-lg",
              positions[side],
            )}
          >
            {content}
            {shortcut && (
              <kbd className="rounded-xs bg-white/15 px-1 font-mono text-2xs text-white/80">{shortcut}</kbd>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
