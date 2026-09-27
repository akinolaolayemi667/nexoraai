import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { transitions } from "@/lib/motion";

export type TabItem = {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  count?: number;
  disabled?: boolean;
  content?: ReactNode;
};

export type TabsProps = {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: "underline" | "segmented";
  className?: string;
  panelClassName?: string;
  "aria-label"?: string;
};

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = "underline",
  className,
  panelClassName,
  "aria-label": ariaLabel,
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value);
  const active = value ?? internal;
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeItem = items.find((item) => item.value === active);

  function select(next: string) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const enabled = items.map((item, i) => ({ item, i })).filter(({ item }) => !item.disabled);
    const current = enabled.findIndex(({ item }) => item.value === active);
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % enabled.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + enabled.length) % enabled.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = enabled.length - 1;
    else return;
    event.preventDefault();
    const target = enabled[next];
    select(target.item.value);
    tabRefs.current[target.i]?.focus();
  }

  const segmented = variant === "segmented";

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        className={cn(
          "flex items-center",
          segmented
            ? "scrollbar-none inline-flex max-w-full gap-0.5 overflow-x-auto rounded-lg border border-hairline bg-slate-500/6 p-0.5 shadow-[inset_0_1px_2px_rgb(15_23_42/0.05)]"
            : "gap-5 border-b border-border",
        )}
      >
        {items.map((item, index) => {
          const selected = item.value === active;
          return (
            <button
              key={item.value}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              id={`${baseId}-tab-${item.value}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={selected && item.content !== undefined ? `${baseId}-panel-${item.value}` : undefined}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => select(item.value)}
              className={cn(
                "relative inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium outline-none transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4",
                segmented
                  ? cn(
                      "h-7 shrink-0 rounded-md px-3 focus-visible:shadow-focus",
                      selected ? "text-ink" : "text-muted hover:bg-white/50 hover:text-ink active:bg-white/60",
                    )
                  : cn(
                      "h-10 rounded-xs focus-visible:shadow-focus",
                      selected ? "text-ink" : "text-muted hover:text-ink active:text-ink",
                    ),
              )}
            >
              {segmented && selected && (
                <motion.span
                  layoutId={`${baseId}-pill`}
                  className="absolute inset-0 rounded-md bg-white shadow-[0_1px_2px_rgb(15_23_42/0.08),0_2px_8px_-4px_rgb(37_99_235/0.25)] ring-1 ring-slate-900/5"
                  transition={transitions.spring}
                  aria-hidden
                />
              )}
              <span className="relative inline-flex items-center gap-1.5">
                {item.icon}
                {item.label}
              </span>
              {item.count !== undefined && (
                <span
                  className={cn(
                    "relative rounded-sm px-1.5 font-mono text-2xs tabular-nums",
                    selected ? "bg-primary-soft text-primary-active" : "bg-sunken text-muted",
                  )}
                >
                  {item.count}
                </span>
              )}
              {!segmented && selected && (
                <motion.span
                  layoutId={`${baseId}-indicator`}
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"
                  transition={transitions.spring}
                />
              )}
            </button>
          );
        })}
      </div>
      {activeItem?.content !== undefined && (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${activeItem.value}`}
          aria-labelledby={`${baseId}-tab-${activeItem.value}`}
          className={cn("pt-5", panelClassName)}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
