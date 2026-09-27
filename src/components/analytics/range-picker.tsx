import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarRange } from "lucide-react";
import { cn } from "@/lib/cn";
import { daysBetween, fromInputDate, rangeLabel, startOfDay, toInputDate, type RangeId } from "@/lib/analytics";
import { duration, ease } from "@/lib/motion";
import { useClickOutside } from "@/hooks/use-click-outside";
import { Button, Input, Tabs } from "@/components/ui";

const MAX_DAYS = 365;

const items: { value: RangeId; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "custom", label: "Custom" },
];

type RangePickerProps = {
  value: RangeId;
  from: Date | null;
  to: Date | null;
  onChange: (range: RangeId, from?: Date, to?: Date) => void;
};

export function RangePicker({ value, from, to, onChange }: RangePickerProps) {
  const [open, setOpen] = useState(false);
  const today = useMemo(() => startOfDay(new Date()), []);
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const refs = useMemo(() => [rootRef], []);
  useClickOutside(refs, () => setOpen(false), open);

  const openPicker = () => {
    const end = to ?? today;
    const start = from ?? new Date(end.getTime() - 13 * 86_400_000);
    setDraftFrom(toInputDate(start));
    setDraftTo(toInputDate(end));
    setOpen(true);
  };

  const error = (() => {
    if (!draftFrom || !draftTo) return "Choose a start and end date.";
    const f = fromInputDate(draftFrom);
    const t = fromInputDate(draftTo);
    if (t < f) return "The end date must be on or after the start date.";
    if (t > today) return "The end date can't be in the future.";
    if (daysBetween(f, t) > MAX_DAYS) return `Choose a range of ${MAX_DAYS} days or fewer.`;
    return null;
  })();

  const apply = () => {
    if (error) return;
    onChange("custom", fromInputDate(draftFrom), fromInputDate(draftTo));
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative flex flex-wrap items-center gap-2">
      <div className="scrollbar-none -mx-1 max-w-full overflow-x-auto px-1">
        <Tabs
          variant="segmented"
          value={open ? "custom" : value}
          onValueChange={(v) => {
            if (v === "custom") openPicker();
            else {
              setOpen(false);
              onChange(v as RangeId);
            }
          }}
          items={items}
        />
      </div>
      {value === "custom" && from && to && !open && (
        <button
          type="button"
          onClick={openPicker}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-white px-2.5 text-xs font-medium text-ink transition-colors hover:border-border-strong"
        >
          <CalendarRange className="size-3.5 text-muted" />
          {rangeLabel(from, to)}
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Custom date range"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: duration.fast, ease: ease.standard }}
            className="absolute right-0 top-full z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] glass-strong rounded-xl p-4"
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "Enter") apply();
            }}
          >
            <p className="text-sm font-semibold text-ink">Custom range</p>
            <p className="mt-0.5 text-xs text-muted">Compared with the same number of days before it.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Input type="date" size="sm" label="From" value={draftFrom} max={toInputDate(today)} onChange={(e) => setDraftFrom(e.target.value)} />
              <Input type="date" size="sm" label="To" value={draftTo} max={toInputDate(today)} onChange={(e) => setDraftTo(e.target.value)} />
            </div>
            <p className={cn("mt-2 min-h-4 text-xs", error ? "text-danger-text" : "text-muted")}>
              {error ?? `${daysBetween(fromInputDate(draftFrom), fromInputDate(draftTo))} days selected`}
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={apply} disabled={error !== null}>
                Apply
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
