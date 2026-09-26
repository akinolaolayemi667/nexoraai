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
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { duration, ease } from "@/lib/motion";
import { useClickOutside } from "@/hooks/use-click-outside";

export type DropdownActionItem = {
  type?: "item";
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  selected?: boolean;
  keepOpen?: boolean;
  onSelect?: () => void;
};

export type DropdownItem =
  | DropdownActionItem
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
  selectable?: boolean;
};

function isAction(item: DropdownItem): item is DropdownActionItem {
  return (item.type ?? "item") === "item";
}

export function Dropdown({
  trigger,
  items,
  align = "start",
  side = "bottom",
  width = "w-56",
  header,
  selectable = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const refs = useMemo(() => [rootRef], []);
  const showChecks = selectable || items.some((item) => isAction(item) && item.selected !== undefined);

  const actionable = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => isAction(item) && !item.disabled)
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
    const selectedIndex = items.findIndex((item) => isAction(item) && item.selected);
    setActiveIndex(focusFirst ? (selectedIndex >= 0 ? selectedIndex : (actionable[0] ?? -1)) : -1);
  }

  function move(delta: number) {
    if (actionable.length === 0) return;
    const position = actionable.indexOf(activeIndex);
    if (position === -1) {
      setActiveIndex(delta > 0 ? actionable[0] : actionable[actionable.length - 1]);
      return;
    }
    setActiveIndex(actionable[(position + delta + actionable.length) % actionable.length]);
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys: Record<string, () => void> = {
      ArrowDown: () => move(1),
      ArrowUp: () => move(-1),
      Home: () => setActiveIndex(actionable[0] ?? -1),
      End: () => setActiveIndex(actionable.at(-1) ?? -1),
      Escape: () => close(),
    };
    if (event.key === "Tab") {
      close(false);
      return;
    }
    const handler = keys[event.key];
    if (handler) {
      event.preventDefault();
      handler();
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
            initial={{ opacity: 0, scale: 0.98, y: side === "bottom" ? -4 : 4 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: duration.fast, ease: ease.emphasized } }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: duration.instant, ease: ease.exit } }}
            className={cn(
              "absolute z-40 rounded-lg border border-border bg-white p-1 shadow-lg",
              side === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5",
              align === "start" ? "left-0" : "right-0",
              side === "bottom"
                ? align === "start" ? "origin-top-left" : "origin-top-right"
                : align === "start" ? "origin-bottom-left" : "origin-bottom-right",
              width,
            )}
          >
            {header && <div className="mb-1 border-b border-border px-2.5 pb-2 pt-1.5">{header}</div>}
            {items.map((item, index) => {
              if (item.type === "separator") {
                return <div key={index} role="separator" className="-mx-1 my-1 h-px bg-border" />;
              }
              if (item.type === "label") {
                return (
                  <div key={index} className="type-overline px-2.5 pb-1 pt-2">
                    {item.label}
                  </div>
                );
              }
              const role = showChecks ? "menuitemcheckbox" : "menuitem";
              return (
                <button
                  key={index}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  type="button"
                  role={role}
                  aria-checked={showChecks ? Boolean(item.selected) : undefined}
                  tabIndex={activeIndex === index ? 0 : -1}
                  disabled={item.disabled}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    item.onSelect?.();
                    if (!item.keepOpen) close();
                  }}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm outline-none transition-colors duration-100 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
                    item.danger
                      ? "text-danger-text focus:bg-danger-soft active:bg-danger-soft"
                      : "text-ink focus:bg-sunken/70 active:bg-sunken [&>svg]:text-muted",
                  )}
                >
                  {showChecks && (
                    <span className="mt-0.5 flex size-4 items-center justify-center">
                      {item.selected && <Check className="text-primary" aria-hidden />}
                    </span>
                  )}
                  {item.icon && <span className="mt-0.5 flex text-muted [&_svg]:size-4">{item.icon}</span>}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{item.label}</span>
                    {item.description && (
                      <span className="block text-xs text-muted">{item.description}</span>
                    )}
                  </span>
                  {item.shortcut && (
                    <kbd className="mt-0.5 font-mono text-2xs text-subtle">{item.shortcut}</kbd>
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
