import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search } from "lucide-react";
import { cn } from "@/lib/cn";
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
            className="absolute inset-0 bg-ink/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            initial={{ opacity: 0, scale: 0.98, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="relative w-full max-w-xl overflow-hidden rounded-lg border border-border bg-white shadow-overlay"
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
              <kbd className="rounded border border-border px-1.5 font-mono text-[11px] text-subtle">
                ESC
              </kbd>
            </div>
            <ul id="command-results" role="listbox" className="scrollbar-thin max-h-80 overflow-y-auto p-1.5">
              {results.length === 0 && (
                <li className="px-3 py-8 text-center text-[13px] text-muted">No matching pages.</li>
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
                    index === active ? "bg-canvas" : "",
                  )}
                >
                  <span className="flex size-7 items-center justify-center rounded-md border border-border bg-white">
                    <item.icon className="size-3.5 text-muted" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-ink">{item.label}</span>
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
