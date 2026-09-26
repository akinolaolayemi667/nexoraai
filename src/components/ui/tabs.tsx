import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

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
};

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = "underline",
  className,
  panelClassName,
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
        onKeyDown={onKeyDown}
        className={cn(
          "flex items-center",
          segmented
            ? "inline-flex gap-0.5 rounded-md border border-border bg-canvas p-0.5"
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
              aria-controls={`${baseId}-panel-${item.value}`}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => select(item.value)}
              className={cn(
                "relative inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-medium outline-none transition-colors disabled:opacity-40 [&_svg]:size-4",
                segmented
                  ? cn(
                      "h-7 rounded px-3",
                      selected ? "bg-white text-ink shadow-xs" : "text-muted hover:text-ink",
                    )
                  : cn("h-10", selected ? "text-ink" : "text-muted hover:text-ink"),
                "focus-visible:ring-2 focus-visible:ring-primary/40",
              )}
            >
              {item.icon}
              {item.label}
              {item.count !== undefined && (
                <span
                  className={cn(
                    "rounded px-1.5 font-mono text-[11px] tabular-nums",
                    selected ? "bg-primary-soft text-primary" : "bg-canvas text-muted",
                  )}
                >
                  {item.count}
                </span>
              )}
              {!segmented && selected && (
                <motion.span
                  layoutId={`${baseId}-indicator`}
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
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
