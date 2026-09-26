import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, MessageCircle, Send, Smartphone, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar, Badge, Button } from "@/components/ui";
import { AppPanel } from "./feature-layout";

type Channel = "email" | "chat" | "sms";
type Message = { id: number; from: "them" | "us"; text: string; time: string };
type Thread = {
  id: string;
  name: string;
  company: string;
  channel: Channel;
  unread: boolean;
  suggestion: string;
  messages: Message[];
};

const channels: Record<Channel, { icon: LucideIcon; label: string }> = {
  email: { icon: Mail, label: "Email" },
  chat: { icon: MessageCircle, label: "Live chat" },
  sms: { icon: Smartphone, label: "SMS" },
};

const initialThreads: Thread[] = [
  {
    id: "t1",
    name: "Chloe Martin",
    company: "Aurora Retail",
    channel: "chat",
    unread: false,
    suggestion: "Absolutely. I've sent a calendar link for a 20-minute demo tomorrow, pick any slot that suits you.",
    messages: [
      { id: 1, from: "them", text: "Hi! Does NEXORA work with Shopify?", time: "10:02" },
      { id: 2, from: "us", text: "It does. Orders and customers sync both ways in real time.", time: "10:03" },
      { id: 3, from: "them", text: "Great. Could we see a demo this week?", time: "10:05" },
    ],
  },
  {
    id: "t2",
    name: "Daniel Reyes",
    company: "Northwind Health",
    channel: "email",
    unread: true,
    suggestion: "Hi Daniel, yes. Growth covers 25 users and includes HIPAA-ready audit logs. I've attached a tailored quote.",
    messages: [
      {
        id: 1,
        from: "them",
        text: "We're comparing plans for a team of 18. Is the audit log available on Growth?",
        time: "09:41",
      },
    ],
  },
  {
    id: "t3",
    name: "Marcus Bell",
    company: "Stackfield",
    channel: "sms",
    unread: false,
    suggestion: "Thanks Marcus! Your invoice is confirmed. See you at Thursday's quarterly review.",
    messages: [
      { id: 1, from: "us", text: "Reminder: quarterly review on Thursday at 2pm.", time: "Yesterday" },
      { id: 2, from: "them", text: "Confirmed, and invoice paid 👍", time: "Yesterday" },
    ],
  },
];

export function ConversationsPreview() {
  const [threads, setThreads] = useState(initialThreads);
  const [activeId, setActiveId] = useState("t1");
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const active = threads.find((t) => t.id === activeId)!;
  const ChannelIcon = channels[active.channel].icon;

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active.messages.length, activeId]);

  function open(id: string) {
    setActiveId(id);
    setDraft("");
    setThreads((list) => list.map((t) => (t.id === id ? { ...t, unread: false } : t)));
  }

  function send(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setThreads((list) =>
      list.map((t) =>
        t.id === activeId
          ? { ...t, messages: [...t.messages, { id: t.messages.length + 1, from: "us", text, time: "Now" }] }
          : t,
      ),
    );
    setDraft("");
  }

  const unread = threads.filter((t) => t.unread).length;

  return (
    <AppPanel label="Interactive unified inbox preview" className="grid grid-cols-1 sm:grid-cols-[13rem_1fr]">
      <div className="hidden flex-col border-r border-border sm:flex">
        <div className="flex h-11 items-center justify-between border-b border-border px-3.5">
          <p className="text-xs font-semibold text-ink">Inbox</p>
          {unread > 0 && (
            <Badge variant="primary" size="sm">
              {unread} new
            </Badge>
          )}
        </div>
        <ul className="flex flex-col p-1.5">
          {threads.map((thread) => {
            const Icon = channels[thread.channel].icon;
            const last = thread.messages[thread.messages.length - 1];
            return (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => open(thread.id)}
                  aria-pressed={thread.id === activeId}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left outline-none transition-colors focus-visible:shadow-focus",
                    thread.id === activeId ? "bg-primary-soft/60" : "hover:bg-canvas",
                  )}
                >
                  <Avatar name={thread.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className={cn("truncate text-xs text-ink", thread.unread ? "font-semibold" : "font-medium")}>
                        {thread.name}
                      </span>
                      <Icon className="size-3 shrink-0 text-subtle" aria-label={channels[thread.channel].label} />
                      {thread.unread && <span className="ml-auto size-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                    </span>
                    <span className="block truncate text-2xs text-muted">{last.text}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex h-11 items-center gap-2 border-b border-border px-3.5">
          <p className="truncate text-xs font-semibold text-ink">{active.name}</p>
          <span className="hidden truncate text-2xs text-muted sm:inline">{active.company}</span>
          <Badge size="sm" icon={<ChannelIcon />} className="ml-auto">
            {channels[active.channel].label}
          </Badge>
        </div>
        <div ref={listRef} className="flex h-52 flex-col gap-2 overflow-y-auto p-3.5 scrollbar-thin" aria-live="polite">
          <AnimatePresence initial={false}>
            {active.messages.map((m) => (
              <motion.div
                key={`${active.id}-${m.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex max-w-[80%] flex-col", m.from === "us" ? "items-end self-end" : "items-start")}
              >
                <p
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs",
                    m.from === "us" ? "rounded-br-xs bg-primary text-white" : "rounded-bl-xs bg-sunken text-ink",
                  )}
                >
                  {m.text}
                </p>
                <span className="mt-0.5 text-2xs text-subtle">{m.time}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <form onSubmit={send} className="border-t border-border p-2.5">
          {!draft && active.messages[active.messages.length - 1].from === "them" && (
            <button
              type="button"
              onClick={() => setDraft(active.suggestion)}
              className="mb-2 flex w-full items-center gap-1.5 rounded-md border border-accent-border bg-accent-soft/60 px-2.5 py-1.5 text-left text-2xs text-accent-hover outline-none transition-colors hover:bg-accent-soft focus-visible:shadow-focus"
            >
              <Sparkles className="size-3 shrink-0" aria-hidden />
              <span className="truncate">
                <span className="font-semibold">Suggested reply:</span> {active.suggestion}
              </span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Reply to ${active.name.split(" ")[0]}…`}
              aria-label="Reply"
              className="h-8 min-w-0 flex-1 rounded-md border border-border bg-white px-2.5 text-xs text-ink outline-none transition-[border-color,box-shadow] placeholder:text-subtle hover:border-border-strong focus:border-primary focus:shadow-focus"
            />
            <Button type="submit" size="icon-sm" aria-label="Send reply" disabled={!draft.trim()}>
              <Send />
            </Button>
          </div>
        </form>
      </div>
    </AppPanel>
  );
}
