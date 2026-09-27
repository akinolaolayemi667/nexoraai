import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { fadeIn, motionStates, scaleIn } from "@/lib/motion";
import { allAppNavItems } from "@/data/navigation";
import { useOverlay } from "@/hooks/use-overlay";

export function CommandMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useOverlay(open, onClose, panelRef);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allAppNavItems;
    const byLabel = allAppNavItems.filter((item) => item.label.toLowerCase().includes(q));
    const byDescription = allAppNavItems.filter(
      (item) => !byLabel.includes(item) && item.description.toLowerCase().includes(q),
    );
    return [...byLabel, ...byDescription];
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  function go(index: number) {
    const item = results[index];
    if (!item) return;
    navigate(item.href);
    onClose();
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
          <motion.div
            className="absolute inset-0 bg-overlay backdrop-blur-[2px]"
            variants={fadeIn}
            {...motionStates}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            variants={scaleIn}
            {...motionStates}
            className="glass-overlay relative w-full max-w-xl overflow-hidden rounded-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="size-4 text-subtle" />
              <input
                data-autofocus
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActive((i) => Math.min(i + 1, results.length - 1));
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActive((i) => Math.max(i - 1, 0));
                  } else if (event.key === "Enter") {
                    event.preventDefault();
                    go(active);
                  }
                }}
                placeholder="Jump to a page…"
                className="h-12 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-subtle"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-results"
                aria-activedescendant={results[active] ? `command-${results[active].href}` : undefined}
              />
              <kbd className="rounded-xs border border-border px-1.5 font-mono text-2xs text-subtle">
                ESC
              </kbd>
            </div>
            <ul id="command-results" role="listbox" className="scrollbar-thin max-h-80 overflow-y-auto p-1.5">
              {results.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-muted">No matching pages.</li>
              )}
              {results.map((item, index) => (
                <li
                  key={item.href}
                  id={`command-${item.href}`}
                  role="option"
                  aria-selected={index === active}
                  onMouseMove={() => setActive(index)}
                  onClick={() => go(index)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2",
                    index === active ? "bg-sunken/70" : "",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-md border bg-white transition-colors duration-100",
                      index === active ? "border-primary-border text-primary" : "border-border text-muted",
                    )}
                  >
                    <item.icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">{item.label}</span>
                    <span className="block truncate text-xs text-muted">{item.description}</span>
                  </span>
                  {index === active && <CornerDownLeft className="size-3.5 text-subtle" />}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
