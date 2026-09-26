import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useClickOutside } from "@/hooks/use-click-outside";

export type DropdownItem =
  | {
      type?: "item";
      label: ReactNode;
      icon?: ReactNode;
      shortcut?: string;
      danger?: boolean;
      disabled?: boolean;
      onSelect?: () => void;
    }
  | { type: "separator" }
  | { type: "label"; label: ReactNode };

type TriggerProps = {
  ref: React.Ref<HTMLButtonElement>;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
};

export type DropdownProps = {
  trigger: (props: TriggerProps & { open: boolean }) => ReactNode;
  items: DropdownItem[];
  align?: "start" | "end";
  side?: "bottom" | "top";
  width?: string;
  header?: ReactNode;
};

export function Dropdown({
  trigger,
  items,
  align = "start",
  side = "bottom",
  width = "w-56",
  header,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const refs = useMemo(() => [rootRef], []);

  const actionable = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => (item.type ?? "item") === "item" && !("disabled" in item && item.disabled))
    .map(({ index }) => index);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    setActiveIndex(-1);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useClickOutside(refs, () => close(false), open);

  useEffect(() => {
    if (open && activeIndex >= 0) itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  function openMenu(focusFirst: boolean) {
    setOpen(true);
    setActiveIndex(focusFirst ? (actionable[0] ?? -1) : -1);
  }

  function move(delta: number) {
    if (actionable.length === 0) return;
    const position = actionable.indexOf(activeIndex);
    const next = (position + delta + actionable.length) % actionable.length;
    setActiveIndex(actionable[position === -1 && delta < 0 ? actionable.length - 1 : next]);
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(actionable[0] ?? -1);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(actionable.at(-1) ?? -1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      close(false);
    }
  }

  return (
    <div ref={rootRef} className="relative inline-flex">
      {trigger({
        ref: triggerRef,
        open,
        onClick: () => (open ? close() : openMenu(false)),
        onKeyDown: (event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openMenu(true);
          }
        },
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": menuId,
      })}
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            onKeyDown={onMenuKeyDown}
            initial={{ opacity: 0, y: side === "bottom" ? -4 : 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className={cn(
              "absolute z-40 rounded-lg border border-border bg-white p-1 shadow-popover",
              side === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5",
              align === "start" ? "left-0 origin-top-left" : "right-0 origin-top-right",
              width,
            )}
          >
            {header && <div className="border-b border-border px-2.5 pb-2 pt-1.5">{header}</div>}
            {items.map((item, index) => {
              if (item.type === "separator") {
                return <div key={index} role="separator" className="my-1 h-px bg-border" />;
              }
              if (item.type === "label") {
                return (
                  <div
                    key={index}
                    className="px-2.5 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-subtle"
                  >
                    {item.label}
                  </div>
                );
              }
              return (
                <button
                  key={index}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={activeIndex === index ? 0 : -1}
                  disabled={item.disabled}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    item.onSelect?.();
                    close();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] outline-none transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
                    item.danger
                      ? "text-danger focus:bg-danger-soft"
                      : "text-ink focus:bg-canvas [&_svg]:text-muted",
                  )}
                >
                  {item.icon}
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.shortcut && (
                    <kbd className="font-mono text-[11px] text-subtle">{item.shortcut}</kbd>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
