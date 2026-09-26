import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { AtSign, Bell, BellOff, CheckCheck, Sparkles, Trophy, UserPlus, Workflow, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { duration, ease } from "@/lib/motion";
import { routes } from "@/lib/routes";
import { useClickOutside } from "@/hooks/use-click-outside";
import { Button, Tabs } from "@/components/ui";

type NotificationKind = "lead" | "deal" | "ai" | "mention" | "automation";

type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  href: string;
  read: boolean;
};

const kinds: Record<NotificationKind, { icon: LucideIcon; className: string }> = {
  lead: { icon: UserPlus, className: "bg-primary-soft text-primary" },
  deal: { icon: Trophy, className: "bg-success-soft text-success-text" },
  ai: { icon: Sparkles, className: "bg-accent-soft text-accent" },
  mention: { icon: AtSign, className: "bg-sky-50 text-sky-700" },
  automation: { icon: Workflow, className: "bg-warning-soft text-warning-text" },
};

const initialNotifications: Notification[] = [
  {
    id: "n1",
    kind: "ai",
    title: "12 high-intent leads need follow-up",
    body: "AI scored them above 80 in the last 24 hours.",
    time: "4m",
    href: routes.app.leads,
    read: false,
  },
  {
    id: "n2",
    kind: "deal",
    title: "Stackfield closed won — $31,000",
    body: "Maya Chen moved the deal to Won.",
    time: "38m",
    href: routes.app.pipeline,
    read: false,
  },
  {
    id: "n3",
    kind: "mention",
    title: "Daniel Okafor mentioned you",
    body: "“@James can you review the Brightline proposal?”",
    time: "1h",
    href: routes.app.conversations,
    read: false,
  },
  {
    id: "n4",
    kind: "lead",
    title: "New lead from organic search",
    body: "Priya Raman · Northwind Health requested a demo.",
    time: "3h",
    href: routes.app.leads,
    read: true,
  },
  {
    id: "n5",
    kind: "automation",
    title: "Lead Qualification ran 412 times today",
    body: "6 runs failed. Open monitoring to review them.",
    time: "5h",
    href: routes.app.automations,
    read: true,
  },
];

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState(initialNotifications);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const refs = useMemo(() => [rootRef], []);
  const navigate = useNavigate();

  const unread = items.filter((item) => !item.read).length;
  const visible = filter === "unread" ? items.filter((item) => !item.read) : items;

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(refs, close, open);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function markAllRead() {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
  }

  function openItem(item: Notification) {
    setItems((current) => current.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
    setOpen(false);
    navigate(item.href);
  }

  return (
    <div ref={rootRef} className="relative">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon-sm"
        className={cn("relative", open && "bg-sunken/70 text-ink")}
        onClick={() => setOpen((v) => !v)}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 font-mono text-[0.5625rem] font-semibold leading-none text-white ring-2 ring-white">
            {unread}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: duration.fast, ease: ease.emphasized } }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: duration.instant, ease: ease.exit } }}
            className="fixed inset-x-3 top-[calc(var(--spacing-topbar)+0.5rem)] z-40 flex max-h-[min(34rem,calc(100dvh-6rem))] origin-top flex-col overflow-hidden rounded-lg border border-border bg-white shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:origin-top-right"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <h2 className="type-h4">Notifications</h2>
                {unread > 0 && (
                  <span className="rounded-sm bg-primary-soft px-1.5 font-mono text-2xs font-medium text-primary-active">
                    {unread} new
                  </span>
                )}
              </div>
              <Button variant="ghost" size="xs" leftIcon={<CheckCheck />} onClick={markAllRead} disabled={unread === 0}>
                Mark all read
              </Button>
            </div>
            <div className="px-4 pt-3">
              <Tabs
                variant="segmented"
                value={filter}
                onValueChange={setFilter}
                items={[
                  { value: "all", label: "All" },
                  { value: "unread", label: "Unread", count: unread },
                ]}
              />
            </div>
            <ul className="scrollbar-thin flex-1 overflow-y-auto p-2">
              {visible.length === 0 && (
                <li className="flex flex-col items-center px-6 py-10 text-center">
                  <span className="flex size-9 items-center justify-center rounded-full bg-sunken text-muted">
                    <BellOff className="size-4" aria-hidden />
                  </span>
                  <p className="mt-3 text-sm font-medium text-ink">You're all caught up</p>
                  <p className="mt-0.5 text-xs text-muted">New activity will show up here.</p>
                </li>
              )}
              {visible.map((item) => {
                const { icon: Icon, className } = kinds[item.kind];
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => openItem(item)}
                      className="flex w-full items-start gap-3 rounded-md px-2.5 py-2.5 text-left outline-none transition-colors duration-100 hover:bg-canvas focus-visible:bg-canvas focus-visible:shadow-focus active:bg-sunken"
                    >
                      <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md", className)}>
                        <Icon className="size-3.5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block text-sm", item.read ? "text-muted" : "font-medium text-ink")}>
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">{item.body}</span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className="font-mono text-2xs text-subtle">{item.time}</span>
                        {!item.read && <span className="size-1.5 rounded-full bg-primary" aria-label="Unread" />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-border bg-canvas px-4 py-2.5">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate(routes.app.settings);
                }}
                className="rounded-xs text-xs font-medium text-muted outline-none hover:text-ink focus-visible:shadow-focus"
              >
                Notification settings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
