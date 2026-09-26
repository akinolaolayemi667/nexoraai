import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUser } from "@/lib/auth/auth-context";
import { ownerById, ownerIdFor } from "@/lib/crm/constants";
import { awaitingReply, channelLabel, lastActivity } from "@/lib/inbox/data";
import { useInbox } from "@/lib/inbox/use-inbox";
import { useNow } from "@/hooks/use-now";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Tabs, useToast } from "@/components/ui";
import { ConversationList, type InboxFilter } from "@/components/inbox/conversation-list";
import { Composer, ConversationHeader, MessageThread } from "@/components/inbox/conversation-view";
import { AiSummaryCard, CustomerDetails } from "@/components/inbox/customer-panel";

type Generation = { id: string; text: string; shown: number; phase: "thinking" | "writing" };
type Pane = "conversation" | "customer" | "summary";

const filters: InboxFilter[] = ["all", "unread", "assigned", "ai"];

export default function ConversationsPage() {
  const user = useUser();
  const now = useNow(30_000);
  const { toast } = useToast();
  const { conversations, actions } = useInbox(user.id, user.name);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [pane, setPane] = useState<Pane>("conversation");
  const [drafts, setDrafts] = useLocalStorage<Record<string, string>>(`nexora:inbox:drafts:${user.id}`, {});
  const [suggestionIdx, setSuggestionIdx] = useState<Record<string, number>>({});
  const [gen, setGen] = useState<Generation | null>(null);

  const myOwnerId = ownerIdFor(user.name);
  const firstName = user.name.split(" ")[0] || "the team";
  const filterParam = params.get("filter") as InboxFilter | null;
  const filter: InboxFilter = filterParam && filters.includes(filterParam) ? filterParam : "all";
  const active = conversations.find((c) => c.id === params.get("c")) ?? null;
  const activeId = active?.id ?? null;

  const updateParams = useCallback(
    (patch: Record<string, string | null>, replace = false) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(patch)) {
            if (value === null) next.delete(key);
            else next.set(key, value);
          }
          return next;
        },
        { replace },
      );
    },
    [setParams],
  );

  const sorted = useMemo(() => [...conversations].sort((a, b) => lastActivity(b) - lastActivity(a)), [conversations]);

  const counts = useMemo<Record<InboxFilter, number>>(
    () => ({
      all: conversations.length,
      unread: conversations.filter((c) => c.unread > 0).length,
      assigned: conversations.filter((c) => c.assigneeId === myOwnerId).length,
      ai: conversations.filter((c) => c.aiHandled).length,
    }),
    [conversations, myOwnerId],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((c) => {
      if (filter === "unread" && c.unread === 0 && c.id !== activeId) return false;
      if (filter === "assigned" && c.assigneeId !== myOwnerId) return false;
      if (filter === "ai" && !c.aiHandled) return false;
      if (!q) return true;
      return [c.customer.name, c.customer.company, c.subject, ...c.messages.map((m) => m.body)].some((text) => text.toLowerCase().includes(q));
    });
  }, [sorted, filter, query, activeId, myOwnerId]);

  const firstVisibleId = visible[0]?.id;
  useEffect(() => {
    if (activeId || !firstVisibleId) return;
    if (window.matchMedia("(min-width: 768px)").matches) updateParams({ c: firstVisibleId }, true);
  }, [activeId, firstVisibleId, updateParams]);

  const { markRead } = actions;
  useEffect(() => {
    if (activeId) markRead(activeId);
  }, [activeId, markRead]);

  useEffect(() => {
    if (!gen) return;
    if (gen.phase === "thinking") {
      const timer = window.setTimeout(() => setGen((g) => g && { ...g, phase: "writing" }), 750);
      return () => window.clearTimeout(timer);
    }
    if (gen.shown >= gen.text.length) {
      setDrafts((d) => ({ ...d, [gen.id]: gen.text }));
      setGen(null);
      return;
    }
    const timer = window.setTimeout(() => setGen((g) => g && { ...g, shown: Math.min(g.text.length, g.shown + 4) }), 14);
    return () => window.clearTimeout(timer);
  }, [gen, setDrafts]);

  const suggestionFor = (id: string) => {
    const c = conversations.find((x) => x.id === id);
    if (!c || c.summary.suggestions.length === 0) return "";
    const idx = (suggestionIdx[id] ?? 0) % c.summary.suggestions.length;
    return c.summary.suggestions[idx].replaceAll("{agent}", firstName);
  };

  function generate(id: string, advance = false) {
    const c = conversations.find((x) => x.id === id);
    if (!c) return;
    const total = c.summary.suggestions.length;
    let idx = suggestionIdx[id] ?? 0;
    if (advance && total > 1) {
      idx = (idx + 1) % total;
      setSuggestionIdx((s) => ({ ...s, [id]: idx }));
    }
    const text = c.summary.suggestions[idx % total]?.replaceAll("{agent}", firstName) ?? "";
    setPane("conversation");
    setDrafts((d) => ({ ...d, [id]: "" }));
    setGen({ id, text, shown: 0, phase: "thinking" });
  }

  function stopGenerating() {
    if (!gen) return;
    const partial = gen.text.slice(0, gen.shown);
    setDrafts((d) => ({ ...d, [gen.id]: partial }));
    setGen(null);
  }

  function nextSuggestion(id: string) {
    const c = conversations.find((x) => x.id === id);
    const total = c?.summary.suggestions.length ?? 0;
    if (total < 2) return;
    setSuggestionIdx((s) => ({ ...s, [id]: ((s[id] ?? 0) + 1) % total }));
  }

  function send() {
    if (!active) return;
    const body = (drafts[active.id] ?? "").trim();
    if (!body) return;
    actions.send(active.id, body);
    setDrafts((d) => {
      const next = { ...d };
      delete next[active.id];
      return next;
    });
    toast({ variant: "success", title: "Reply sent", description: `Sent to ${active.customer.name} via ${channelLabel[active.channel]}.` });
  }

  function toggleStatus() {
    if (!active) return;
    const id = active.id;
    const prev = active.status;
    const next = prev === "resolved" ? "open" : "resolved";
    actions.setStatus(id, next);
    toast({
      variant: next === "resolved" ? "success" : "info",
      title: next === "resolved" ? "Conversation resolved" : "Conversation reopened",
      description: active.customer.name,
      action: { label: "Undo", onClick: () => actions.setStatus(id, prev) },
    });
  }

  function assign(ownerId: string | null) {
    if (!active) return;
    actions.assign(active.id, ownerId);
    toast({
      variant: "info",
      title: ownerId ? (ownerId === myOwnerId ? "Assigned to you" : `Assigned to ${ownerById(ownerId).name}`) : "Conversation unassigned",
      description: `${active.customer.name} · ${active.customer.company}`,
    });
  }

  function markUnread() {
    if (!active) return;
    actions.markUnread(active.id);
    toast({ variant: "info", title: "Marked as unread", description: active.customer.name });
  }

  const awaiting = conversations.filter(awaitingReply).length;
  const activeGen = gen && active && gen.id === active.id ? gen : null;
  const draft = activeGen ? activeGen.text.slice(0, activeGen.shown) : active ? (drafts[active.id] ?? "") : "";
  const activeIdx = active && active.summary.suggestions.length ? (suggestionIdx[active.id] ?? 0) % active.summary.suggestions.length : 0;

  return (
    <div className="flex min-h-0 flex-1 bg-white">
      <title>Inbox · NEXORA AI</title>

      <aside className={cn("w-full min-w-0 shrink-0 flex-col border-r border-border bg-canvas md:flex md:w-80 xl:w-[22rem]", active ? "hidden" : "flex")}>
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-ink">Conversations</h1>
            <p className="truncate text-xs text-muted">
              {counts.unread} unread · {awaiting} awaiting reply
            </p>
          </div>
        </div>
        <ConversationList
          conversations={visible}
          counts={counts}
          filter={filter}
          onFilter={(f) => updateParams({ filter: f === "all" ? null : f }, true)}
          query={query}
          onQuery={setQuery}
          activeId={activeId}
          onSelect={(id) => updateParams({ c: id })}
          now={now}
        />
      </aside>

      <section className={cn("min-w-0 flex-1 flex-col", active ? "flex" : "hidden md:flex")} aria-label="Conversation">
        {active ? (
          <>
            <ConversationHeader
              conversation={active}
              myOwnerId={myOwnerId}
              onBack={() => updateParams({ c: null })}
              onAssign={assign}
              onToggleStatus={toggleStatus}
              onMarkUnread={markUnread}
            />
            <div className="scrollbar-none shrink-0 overflow-x-auto border-b border-border bg-white px-3 py-2 sm:px-5 xl:hidden">
              <Tabs
                variant="segmented"
                value={pane}
                onValueChange={(v) => setPane(v as Pane)}
                items={[
                  { value: "conversation", label: "Conversation" },
                  { value: "customer", label: "Customer" },
                  { value: "summary", label: "AI Summary" },
                ]}
              />
            </div>
            <div className={cn("min-h-0 flex-1 flex-col", pane === "conversation" ? "flex" : "hidden xl:flex")}>
              <MessageThread conversation={active} now={now} />
              <Composer
                conversation={active}
                value={draft}
                onChange={(v) => setDrafts((d) => ({ ...d, [active.id]: v }))}
                phase={activeGen?.phase ?? null}
                onGenerate={() => generate(active.id, Boolean(draft.trim()))}
                onStop={stopGenerating}
                onSend={send}
              />
            </div>
            {pane !== "conversation" && (
              <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto bg-canvas p-4 sm:p-6 xl:hidden">
                <div className="mx-auto max-w-xl">
                  {pane === "customer" ? (
                    <div className="rounded-lg border border-border bg-white p-4">
                      <CustomerDetails conversation={active} />
                    </div>
                  ) : (
                    <AiSummaryCard
                      conversation={active}
                      suggestion={suggestionFor(active.id)}
                      suggestionIndex={activeIdx}
                      busy={Boolean(activeGen)}
                      onGenerate={() => generate(active.id)}
                      onNextSuggestion={() => nextSuggestion(active.id)}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-sunken text-subtle">
              <Inbox className="size-6" />
            </span>
            <p className="mt-4 text-sm font-medium text-ink">No conversation selected</p>
            <p className="mt-1 max-w-xs text-sm text-muted">Pick a conversation from the list to read the thread, see the customer and get an AI summary.</p>
          </div>
        )}
      </section>

      {active && (
        <aside className="scrollbar-thin hidden w-80 shrink-0 flex-col gap-6 overflow-y-auto border-l border-border bg-canvas p-4 xl:flex 2xl:w-96" aria-label="Customer and AI summary">
          <AiSummaryCard
            conversation={active}
            suggestion={suggestionFor(active.id)}
            suggestionIndex={activeIdx}
            busy={Boolean(activeGen)}
            onGenerate={() => generate(active.id)}
            onNextSuggestion={() => nextSuggestion(active.id)}
          />
          <CustomerDetails conversation={active} />
        </aside>
      )}
    </div>
  );
}
