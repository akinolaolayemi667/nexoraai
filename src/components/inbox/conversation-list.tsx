import { CheckCircle2, Inbox, Mail, MessageCircle, MessageCircleMore, Search, Smartphone, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { lastMessage, type InboxChannel, type InboxConversation } from "@/lib/inbox/data";
import { Avatar, Input } from "@/components/ui";

export type InboxFilter = "all" | "unread" | "assigned" | "ai";

export const channelIcon: Record<InboxChannel, typeof Mail> = { email: Mail, chat: MessageCircle, sms: Smartphone, whatsapp: MessageCircleMore };

export function inboxTime(ts: number, now: number) {
  const diff = now - ts;
  if (diff < 45_000) return "Just now";
  const min = Math.round(diff / 60_000);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(diff / 3_600_000);
  if (hr < 24) return `${hr} hr ago`;
  const days = Math.floor(hr / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(ts);
}

type ConversationListProps = {
  conversations: InboxConversation[];
  counts: Record<InboxFilter, number>;
  filter: InboxFilter;
  onFilter: (filter: InboxFilter) => void;
  query: string;
  onQuery: (query: string) => void;
  activeId: string | null;
  onSelect: (id: string) => void;
  now: number;
};

const filterLabels: Record<InboxFilter, string> = { all: "All", unread: "Unread", assigned: "Assigned", ai: "AI" };

export function ConversationList({ conversations, counts, filter, onFilter, query, onQuery, activeId, onSelect, now }: ConversationListProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-3 border-b border-border p-3">
        <div role="radiogroup" aria-label="Filter conversations" className="flex gap-0.5 rounded-md border border-border bg-sunken p-0.5">
          {(Object.keys(filterLabels) as InboxFilter[]).map((f) => {
            const selected = f === filter;
            return (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onFilter(f)}
                className={cn(
                  "flex h-7 min-w-0 flex-auto items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium outline-none transition-colors focus-visible:shadow-focus",
                  selected ? "bg-white text-ink shadow-xs ring-1 ring-border" : "text-muted hover:text-ink",
                )}
              >
                {f === "ai" && <Sparkles className="size-3 shrink-0 text-accent" aria-hidden />}
                <span className="truncate">{filterLabels[f]}</span>
                <span className={cn("font-mono text-[0.625rem] tabular-nums", selected ? "text-primary" : "text-subtle")}>{counts[f]}</span>
              </button>
            );
          })}
        </div>
        <Input size="sm" value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search name, company or message" leftIcon={<Search />} aria-label="Search conversations" type="search" />
      </div>

      <nav aria-label="Conversations" className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-sunken text-subtle">
              <Inbox className="size-5" />
            </span>
            <p className="mt-3 text-sm font-medium text-ink">{query ? "No matches" : filter === "unread" ? "You're all caught up" : "No conversations here"}</p>
            <p className="mt-1 text-xs text-muted">{query ? "Try a different name or keyword." : filter === "unread" ? "New messages will show up here." : "Try another filter."}</p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((c) => {
              const last = lastMessage(c);
              const active = c.id === activeId;
              const unread = c.unread > 0;
              const Icon = channelIcon[c.channel];
              const prefix = last?.from === "agent" ? "You: " : last?.from === "ai" ? "AI: " : "";
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex w-full gap-3 rounded-md px-2.5 py-2.5 text-left outline-none transition-colors focus-visible:shadow-focus",
                      active ? "bg-primary-soft/50 ring-1 ring-primary-border" : "hover:bg-canvas",
                    )}
                  >
                    <span className="relative flex shrink-0 self-start">
                      <Avatar name={c.customer.name} size="md" />
                      <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-white text-muted ring-1 ring-border">
                        <Icon className="size-2.5" aria-hidden />
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className={cn("min-w-0 flex-1 truncate text-sm", unread ? "font-semibold text-ink" : "font-medium text-ink/90")}>{c.customer.name}</span>
                        <span className={cn("shrink-0 text-2xs tabular-nums", unread ? "font-medium text-primary" : "text-subtle")}>{last ? inboxTime(last.at, now) : ""}</span>
                      </span>
                      <span className="block truncate text-xs text-muted">{c.customer.company}</span>
                      <span className="mt-1 flex items-center gap-1.5">
                        <span className={cn("min-w-0 flex-1 truncate text-xs", unread ? "text-ink" : "text-subtle")}>
                          {prefix}
                          {last?.body.replace(/\s+/g, " ")}
                        </span>
                        {c.aiHandled && (
                          <span className="flex size-4 shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent" title="Handled by AI">
                            <Sparkles className="size-2.5" aria-label="Handled by AI" />
                          </span>
                        )}
                        {c.status === "resolved" && <CheckCircle2 className="size-3.5 shrink-0 text-success" aria-label="Resolved" />}
                        {unread && (
                          <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-primary px-1 font-mono text-[0.625rem] font-semibold text-white" aria-label={`${c.unread} unread`}>
                            {c.unread}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </div>
  );
}
