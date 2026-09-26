import { Fragment, useEffect, useRef, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Mail, MoreHorizontal, RotateCcw, Send, Sparkles, Square, UserRound, UserRoundX } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/format";
import { ownerById, owners } from "@/lib/crm/constants";
import { channelLabel, type InboxConversation, type InboxMessage } from "@/lib/inbox/data";
import { Avatar, Badge, Button, Dropdown, Spinner } from "@/components/ui";
import { channelIcon } from "./conversation-list";

type HeaderProps = {
  conversation: InboxConversation;
  myOwnerId: string;
  onBack: () => void;
  onAssign: (ownerId: string | null) => void;
  onToggleStatus: () => void;
  onMarkUnread: () => void;
};

export function ConversationHeader({ conversation: c, myOwnerId, onBack, onAssign, onToggleStatus, onMarkUnread }: HeaderProps) {
  const assignee = c.assigneeId ? ownerById(c.assigneeId) : null;
  const resolved = c.status === "resolved";
  const ChannelIcon = channelIcon[c.channel];

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-white px-3 sm:px-5">
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 flex size-8 shrink-0 items-center justify-center rounded-md text-muted outline-none hover:bg-sunken hover:text-ink focus-visible:shadow-focus md:hidden"
        aria-label="Back to conversations"
      >
        <ArrowLeft className="size-4" />
      </button>
      <Avatar name={c.customer.name} size="md" className="hidden sm:inline-flex" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-sm font-semibold text-ink">{c.customer.name}</h2>
          {resolved && (
            <Badge variant="success" size="sm" dot>
              Resolved
            </Badge>
          )}
        </div>
        <p className="flex items-center gap-1.5 truncate text-xs text-muted">
          <span className="truncate">{c.customer.company}</span>
          <span aria-hidden>·</span>
          <ChannelIcon className="size-3 shrink-0" aria-hidden />
          <span className="shrink-0">{channelLabel[c.channel]}</span>
        </p>
      </div>

      <Dropdown
        align="end"
        width="w-60"
        selectable
        trigger={({ open, ...props }) => (
          <button
            {...props}
            type="button"
            className={cn(
              "flex h-8 items-center gap-2 rounded-md border border-border bg-white px-2 text-xs font-medium text-ink outline-none transition-colors hover:bg-canvas focus-visible:shadow-focus",
              open && "bg-canvas",
            )}
            aria-label={assignee ? `Assigned to ${assignee.name}. Change assignee` : "Unassigned. Assign conversation"}
          >
            {assignee ? <Avatar name={assignee.name} size="xs" /> : <UserRound className="size-4 text-subtle" aria-hidden />}
            <span className="hidden max-w-28 truncate 2xl:inline">{assignee ? assignee.name : "Unassigned"}</span>
          </button>
        )}
        items={[
          { type: "label", label: "Assign to" },
          ...(c.assigneeId !== myOwnerId ? [{ label: "Assign to me", icon: <UserRound />, onSelect: () => onAssign(myOwnerId) }, { type: "separator" as const }] : []),
          ...owners.map((o) => ({
            label: o.name,
            description: o.title,
            icon: <Avatar name={o.name} size="xs" />,
            selected: c.assigneeId === o.id,
            onSelect: () => onAssign(o.id),
          })),
          { type: "separator" as const },
          { label: "Unassign", icon: <UserRoundX />, disabled: !c.assigneeId, onSelect: () => onAssign(null) },
        ]}
      />

      <Button size="sm" variant={resolved ? "secondary" : "primary"} leftIcon={resolved ? <RotateCcw /> : <CheckCircle2 />} onClick={onToggleStatus} className="max-sm:px-2" aria-label={resolved ? "Reopen conversation" : "Resolve conversation"}>
        <span className="max-sm:sr-only">{resolved ? "Reopen" : "Resolve"}</span>
      </Button>

      <Dropdown
        align="end"
        trigger={({ open, ...props }) => (
          <button
            {...props}
            type="button"
            className={cn("flex size-8 items-center justify-center rounded-md text-muted outline-none hover:bg-sunken hover:text-ink focus-visible:shadow-focus", open && "bg-sunken text-ink")}
            aria-label="More actions"
          >
            <MoreHorizontal className="size-4" />
          </button>
        )}
        items={[
          { label: "Mark as unread", icon: <Mail />, onSelect: onMarkUnread },
          { label: resolved ? "Reopen conversation" : "Resolve conversation", icon: resolved ? <RotateCcw /> : <CheckCircle2 />, onSelect: onToggleStatus },
        ]}
      />
    </header>
  );
}

const dayFormat = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });

function dayLabel(ts: number, now: number) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (ts >= start.getTime()) return "Today";
  if (ts >= start.getTime() - 86_400_000) return "Yesterday";
  return dayFormat.format(ts);
}

function MessageBubble({ message }: { message: InboxMessage }) {
  const outbound = message.from !== "customer";
  const ai = message.from === "ai";
  return (
    <div className={cn("flex gap-2.5", outbound && "flex-row-reverse")}>
      {ai ? (
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-white">
          <Sparkles className="size-3.5" aria-hidden />
        </span>
      ) : (
        <Avatar name={message.author} size="sm" className="mt-0.5" />
      )}
      <div className={cn("flex max-w-[85%] flex-col sm:max-w-[75%]", outbound && "items-end")}>
        <div
          className={cn(
            "whitespace-pre-wrap rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
            !outbound && "rounded-tl-xs bg-sunken text-ink",
            outbound && !ai && "rounded-tr-xs bg-primary text-white",
            ai && "rounded-tr-xs border border-accent-border bg-accent-soft text-ink",
          )}
        >
          {message.body}
        </div>
        <p className="mt-1 flex items-center gap-1.5 px-1 text-2xs text-subtle">
          {ai && <span className="font-medium text-accent">AI agent</span>}
          {!ai && <span>{message.author}</span>}
          <span aria-hidden>·</span>
          <time dateTime={new Date(message.at).toISOString()}>{formatTime(message.at)}</time>
        </p>
      </div>
    </div>
  );
}

export function MessageThread({ conversation: c, now }: { conversation: InboxConversation; now: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [c.id, c.messages.length]);

  let lastDay = "";
  return (
    <div ref={scrollRef} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto bg-white">
      <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="rounded-full border border-border bg-canvas px-3 py-1 text-xs font-medium text-ink">{c.subject}</span>
          {c.aiHandled && (
            <span className="mt-2 inline-flex items-center gap-1 text-2xs text-muted">
              <Sparkles className="size-3 text-accent" aria-hidden />
              AI agent handled the first response
            </span>
          )}
        </div>
        <ol className="space-y-4" aria-label={`Messages with ${c.customer.name}`}>
          {c.messages.map((m) => {
            const day = dayLabel(m.at, now);
            const showDay = day !== lastDay;
            lastDay = day;
            return (
              <Fragment key={m.id}>
                {showDay && (
                  <li className="flex items-center gap-3 py-1" aria-hidden>
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-2xs font-medium uppercase tracking-wide text-subtle">{day}</span>
                    <span className="h-px flex-1 bg-border" />
                  </li>
                )}
                <li>
                  <MessageBubble message={m} />
                </li>
              </Fragment>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export type GenerationPhase = "thinking" | "writing" | null;

type ComposerProps = {
  conversation: InboxConversation;
  value: string;
  onChange: (value: string) => void;
  phase: GenerationPhase;
  onGenerate: () => void;
  onStop: () => void;
  onSend: () => void;
};

export function Composer({ conversation: c, value, onChange, phase, onGenerate, onStop, onSend }: ComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const busy = phase !== null;
  const canSend = !busy && value.trim().length > 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
    if (phase === "writing") el.scrollTop = el.scrollHeight;
  }, [value, phase]);

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSend) {
      e.preventDefault();
      onSend();
    }
  }

  const recipient = c.channel === "email" ? c.customer.email : c.channel === "chat" ? "live chat" : c.customer.phone;

  return (
    <div className="shrink-0 border-t border-border bg-white px-3 pb-3 pt-2.5 sm:px-5 sm:pb-4">
      <div className="mx-auto w-full max-w-3xl">
        <div className={cn("rounded-lg border bg-white transition-shadow focus-within:border-primary focus-within:shadow-focus", busy ? "border-accent-border" : "border-border-strong")}>
          <div className="relative">
            <textarea
              ref={ref}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyDown}
              readOnly={busy}
              rows={3}
              placeholder={`Reply to ${c.customer.name.split(" ")[0]}…`}
              aria-label={`Reply to ${c.customer.name}`}
              className="block max-h-60 min-h-20 w-full resize-none rounded-t-lg bg-transparent px-3.5 py-3 text-sm leading-relaxed text-ink outline-none placeholder:text-subtle"
            />
            <AnimatePresence>
              {phase === "thinking" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center gap-2 rounded-t-lg bg-white/85 px-3.5 text-sm text-accent"
                >
                  <Spinner className="size-4" />
                  Reading the conversation and CRM context…
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-border px-2 py-2">
            {busy ? (
              <Button size="sm" variant="secondary" leftIcon={<Square className="fill-current" />} onClick={onStop}>
                Stop
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Sparkles className="text-accent" />}
                onClick={onGenerate}
                className="border-accent-border bg-accent-soft/60 text-accent hover:bg-accent-soft"
              >
                {value.trim() ? "Regenerate" : "Generate response"}
              </Button>
            )}
            <span className="min-w-0 flex-1 truncate text-2xs text-subtle">
              {phase === "writing" ? (
                <span className="text-accent">Writing a reply…</span>
              ) : (
                <>
                  Via {channelLabel[c.channel]} to <span className="text-muted">{recipient}</span>
                </>
              )}
            </span>
            <kbd className="hidden rounded-xs border border-border bg-canvas px-1.5 font-mono text-2xs text-subtle lg:inline">Ctrl ↵</kbd>
            <Button size="sm" leftIcon={<Send />} onClick={onSend} disabled={!canSend}>
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
