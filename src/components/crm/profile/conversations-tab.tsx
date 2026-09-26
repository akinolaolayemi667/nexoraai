import { useEffect, useRef, useState, type FormEvent } from "react";
import { Mail, MessageCircle, MessagesSquare, Send, Smartphone, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCrm } from "@/lib/crm/crm-context";
import type { Lead, Thread } from "@/lib/crm/types";
import { formatRelative, formatTime } from "@/lib/format";
import { Avatar, Button, EmptyState, Textarea, useToast } from "@/components/ui";

const channelIcon = { email: Mail, chat: MessageCircle, sms: Smartphone };
const channelLabel = { email: "Email", chat: "Live chat", sms: "SMS" };

function draftReply(lead: Lead, thread: Thread) {
  const first = lead.name.split(" ")[0];
  const last = thread.messages.at(-1);
  if (last?.direction === "outbound") {
    return `Hi ${first}, just checking in on my last note. Happy to set up a quick call if that's easier — does Tuesday or Wednesday work?`;
  }
  if (thread.channel === "chat") {
    return `Hi ${first}! Happy to help. Want me to send over a short walkthrough video of the integration setup?`;
  }
  return `Hi ${first}, thanks for the note! I'd love to show you how teams like ${lead.company} use Nexora. Would a 20-minute demo on Thursday work?`;
}

export function ConversationsTab({ lead, threads, now }: { lead: Lead; threads: Thread[]; now: number }) {
  const { actions, actor } = useCrm();
  const { toast } = useToast();
  const [activeId, setActiveId] = useState(threads[0]?.id);
  const [body, setBody] = useState("");
  const [drafting, setDrafting] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const active = threads.find((t) => t.id === activeId) ?? threads[0];

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [active?.messages.length]);

  useEffect(() => {
    if (!drafting || !active) return;
    const timer = window.setTimeout(() => {
      setBody(draftReply(lead, active));
      setDrafting(false);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [drafting, active, lead]);

  if (!active) {
    return (
      <EmptyState
        size="sm"
        bordered
        icon={<MessagesSquare />}
        title="No conversations yet"
        description="Emails, chats and texts with this contact will appear here."
      />
    );
  }

  function send(event?: FormEvent) {
    event?.preventDefault();
    if (!body.trim() || !active) return;
    actions.reply(lead.id, active.id, body.trim());
    setBody("");
    toast({ variant: "success", title: "Reply sent", description: `To ${lead.email}` });
  }

  return (
    <div className="grid gap-4 md:grid-cols-[14rem_1fr]">
      <ul className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 md:mx-0 md:flex-col md:overflow-visible md:px-0">
        {threads.map((thread) => {
          const Icon = channelIcon[thread.channel];
          const last = thread.messages.at(-1);
          const selected = thread.id === active.id;
          const awaiting = last?.direction === "inbound";
          return (
            <li key={thread.id} className="min-w-56 md:min-w-0">
              <button
                type="button"
                onClick={() => setActiveId(thread.id)}
                aria-pressed={selected}
                className={cn(
                  "w-full rounded-lg border p-3 text-left outline-none transition-colors duration-150 focus-visible:shadow-focus",
                  selected ? "border-primary-border bg-primary-soft/30" : "border-border bg-white hover:bg-canvas",
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="size-3.5 text-muted" aria-hidden />
                  <span className="flex-1 truncate text-sm font-medium text-ink">{thread.subject}</span>
                  {awaiting && <span className="size-2 rounded-full bg-primary" aria-label="Awaiting reply" />}
                </span>
                <span className="mt-1 block truncate text-xs text-muted">{last?.body}</span>
                <span className="mt-1 block font-mono text-2xs tabular-nums text-subtle">
                  {channelLabel[thread.channel]} · {last ? formatRelative(last.at, now) : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex min-w-0 flex-col rounded-lg border border-border">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{active.subject}</p>
            <p className="truncate text-xs text-muted">
              {channelLabel[active.channel]} with {lead.name}
            </p>
          </div>
        </div>
        <div className="scrollbar-thin max-h-[26rem] space-y-4 overflow-y-auto px-4 py-4">
          {active.messages.map((message) => {
            const outbound = message.direction === "outbound";
            return (
              <div key={message.id} className={cn("flex gap-2.5", outbound && "flex-row-reverse")}>
                <Avatar name={message.author} size="sm" />
                <div className={cn("max-w-[80%]", outbound && "text-right")}>
                  <div
                    className={cn(
                      "inline-block whitespace-pre-wrap rounded-lg px-3 py-2 text-left text-sm leading-relaxed",
                      outbound ? "rounded-tr-xs bg-primary text-white" : "rounded-tl-xs bg-sunken text-ink",
                    )}
                  >
                    {message.body}
                  </div>
                  <p className="mt-1 font-mono text-2xs tabular-nums text-subtle">
                    {message.author.split(" ")[0]} · {now - message.at < 86_400_000 ? formatTime(message.at) : formatRelative(message.at, now)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="border-t border-border p-3">
          <Textarea
            aria-label="Reply"
            rows={3}
            placeholder={drafting ? "Drafting a reply…" : `Reply to ${lead.name.split(" ")[0]}…`}
            value={body}
            disabled={drafting}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
            }}
            className="resize-none"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Sparkles />}
              loading={drafting}
              loadingText="Drafting…"
              onClick={() => setDrafting(true)}
              className="-ml-2"
            >
              Draft with AI
            </Button>
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-subtle sm:inline">Sending as {actor.split(" ")[0]}</span>
              <Button type="submit" size="sm" leftIcon={<Send />} disabled={!body.trim()}>
                Send
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
