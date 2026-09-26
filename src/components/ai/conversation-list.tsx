import { useMemo, useState, type FormEvent } from "react";
import { MessageSquarePlus, MessagesSquare, MoreHorizontal, PencilLine, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Conversation } from "@/lib/ai/types";
import { Button, Dropdown, Input } from "@/components/ui";

const DAY = 24 * 3600_000;

function groupLabel(timestamp: number, now: number) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const today = start.getTime();
  if (timestamp >= today) return "Today";
  if (timestamp >= today - DAY) return "Yesterday";
  if (timestamp >= today - 7 * DAY) return "Previous 7 days";
  return "Older";
}

type ConversationListProps = {
  conversations: Conversation[];
  activeId: string | null;
  now: number;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
};

export function ConversationList({ conversations, activeId, now, onSelect, onNew, onRename, onDelete }: ConversationListProps) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ id: string; title: string } | null>(null);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = [...conversations]
      .filter(
        (c) =>
          !q ||
          c.title.toLowerCase().includes(q) ||
          c.messages.some((m) => m.content.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
    const map = new Map<string, Conversation[]>();
    filtered.forEach((c) => {
      const label = groupLabel(c.updatedAt, now);
      map.set(label, [...(map.get(label) ?? []), c]);
    });
    return [...map.entries()];
  }, [conversations, query, now]);

  const commitRename = (event?: FormEvent) => {
    event?.preventDefault();
    if (!editing) return;
    const title = editing.title.trim();
    if (title) onRename(editing.id, title);
    setEditing(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-3 p-3">
        <Button variant="secondary" className="w-full justify-start" leftIcon={<MessageSquarePlus />} onClick={onNew}>
          New conversation
        </Button>
        <Input
          size="sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversations"
          leftIcon={<Search />}
          aria-label="Search conversations"
        />
      </div>

      <nav className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-2 pb-3" aria-label="AI conversations">
        {groups.length === 0 && (
          <div className="flex flex-col items-center px-4 py-10 text-center">
            <MessagesSquare className="size-5 text-subtle" />
            <p className="mt-2 text-sm font-medium text-ink">{query ? "No matches" : "No conversations yet"}</p>
            <p className="mt-1 text-xs text-muted">{query ? "Try a different search." : "Start one to see it here."}</p>
          </div>
        )}
        {groups.map(([label, items]) => (
          <div key={label} className="mt-2 first:mt-0">
            <p className="type-overline px-2 pb-1 pt-2 text-subtle">{label}</p>
            <ul className="space-y-0.5">
              {items.map((conversation) => {
                const active = conversation.id === activeId;
                const isEditing = editing?.id === conversation.id;
                const preview = [...conversation.messages].reverse().find((m) => m.role === "assistant")?.content ?? "";
                return (
                  <li key={conversation.id} className="group relative">
                    {isEditing ? (
                      <form onSubmit={commitRename} className="px-1 py-0.5">
                        <Input
                          size="sm"
                          autoFocus
                          value={editing.title}
                          onChange={(e) => setEditing({ id: conversation.id, title: e.target.value })}
                          onBlur={() => commitRename()}
                          onKeyDown={(e) => e.key === "Escape" && setEditing(null)}
                          aria-label="Conversation name"
                        />
                      </form>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onSelect(conversation.id)}
                          aria-current={active ? "true" : undefined}
                          className={cn(
                            "block w-full rounded-md px-2.5 py-2 pr-9 text-left transition-colors",
                            active ? "bg-white shadow-xs ring-1 ring-border" : "hover:bg-white/70",
                          )}
                        >
                          <span className={cn("block truncate text-sm", active ? "font-medium text-ink" : "text-ink/85")}>
                            {conversation.title}
                          </span>
                          <span className="block truncate text-xs text-subtle">{preview.replace(/\*\*/g, "") || "No reply yet"}</span>
                        </button>
                        <div
                          className={cn(
                            "absolute right-1 top-1.5 transition-opacity",
                            active ? "opacity-100" : "opacity-100 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100",
                          )}
                        >
                          <Dropdown
                            align="end"
                            width="w-44"
                            trigger={({ open, ...props }) => (
                              <Button
                                {...props}
                                variant="ghost"
                                size="icon-xs"
                                aria-label={`Options for ${conversation.title}`}
                                className={cn(open && "bg-sunken")}
                              >
                                <MoreHorizontal />
                              </Button>
                            )}
                            items={[
                              {
                                label: "Rename",
                                icon: <PencilLine />,
                                onSelect: () => setEditing({ id: conversation.id, title: conversation.title }),
                              },
                              { type: "separator" },
                              { label: "Delete", icon: <Trash2 />, danger: true, onSelect: () => onDelete(conversation.id) },
                            ]}
                          />
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
