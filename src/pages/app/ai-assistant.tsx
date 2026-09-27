import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AnimatePresence } from "framer-motion";
import { MessageSquarePlus, PanelLeft } from "lucide-react";
import { useUser } from "@/lib/auth/auth-context";
import { useCrm } from "@/lib/crm/crm-context";
import { dueFromOption } from "@/lib/crm/insights";
import { followUpConfirmation, mockReply } from "@/lib/ai/engine";
import type { AiAction, AiMessage, AiReply, Attachment } from "@/lib/ai/types";
import { aiId, useConversations } from "@/lib/ai/use-conversations";
import { useNow } from "@/hooks/use-now";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Badge, Button, Drawer, Tooltip, useToast } from "@/components/ui";
import { AssistantMark, MessageRow, TypingIndicator } from "@/components/ai/chat-message";
import { ChatInput, type ChatInputHandle } from "@/components/ai/chat-input";
import { ConversationList } from "@/components/ai/conversation-list";
import { InsightCards } from "@/components/ai/insight-cards";

type Pending = {
  convId: string;
  messageId: string;
  reply: AiReply;
  phase: "thinking" | "streaming";
  delay: number;
  visible: number;
};

const starterPrompts = [
  "Which leads should I follow up with today?",
  "Which deals are at risk?",
  "What's my pipeline forecast?",
  "Draft a check-in email for Aurora Retail",
];

function greeting(now: number) {
  const hour = new Date(now).getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

export default function AiAssistantPage() {
  const user = useUser();
  const now = useNow(30_000);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state, actions } = useCrm();
  const { conversations, create, append, updateMessage, rename, remove, restore } = useConversations();
  const [params, setParams] = useSearchParams();
  const [pending, setPending] = useState<Pending | null>(null);
  const history = useDisclosure();
  const inputRef = useRef<ChatInputHandle>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  const activeId = params.get("c");
  const active = useMemo(() => conversations.find((c) => c.id === activeId) ?? null, [conversations, activeId]);

  const selectConversation = useCallback(
    (id: string | null) => {
      setParams(id ? { c: id } : {});
      history.close();
    },
    [setParams, history],
  );

  /* Reply lifecycle: thinking -> stream word by word -> done. */
  useEffect(() => {
    if (!pending) return;
    if (pending.phase === "thinking") {
      const timer = window.setTimeout(() => {
        append(pending.convId, { id: pending.messageId, role: "assistant", at: Date.now(), ...pending.reply });
        setPending((p) => p && { ...p, phase: "streaming", visible: 0 });
      }, pending.delay);
      return () => window.clearTimeout(timer);
    }
    const content = pending.reply.content;
    if (pending.visible >= content.length) {
      setPending(null);
      return;
    }
    const timer = window.setTimeout(() => {
      setPending((p) => {
        if (!p) return p;
        const next = p.reply.content.indexOf(" ", p.visible + 1);
        return { ...p, visible: next === -1 ? p.reply.content.length : next };
      });
    }, 24);
    return () => window.clearTimeout(timer);
  }, [pending, append]);

  const queueReply = useCallback((convId: string, reply: AiReply, delay = 900 + Math.random() * 700) => {
    stickToBottom.current = true;
    setPending({ convId, messageId: aiId("msg"), reply, phase: "thinking", delay, visible: 0 });
  }, []);

  const send = useCallback(
    (text: string, attachments: Attachment[] = []) => {
      if (pending) return;
      const at = Date.now();
      const message: AiMessage = {
        id: aiId("msg"),
        role: "user",
        content: text,
        at,
        attachments: attachments.length ? attachments : undefined,
      };
      let convId = active?.id;
      if (convId) append(convId, message);
      else {
        convId = create(message);
        setParams({ c: convId });
      }
      queueReply(convId, mockReply(text, state, attachments, at));
    },
    [pending, active, append, create, setParams, queueReply, state],
  );

  const stop = useCallback(() => {
    if (!pending) return;
    if (pending.phase === "thinking") {
      append(pending.convId, { id: pending.messageId, role: "assistant", content: "", at: Date.now(), stopped: true });
    } else {
      updateMessage(pending.convId, pending.messageId, {
        content: pending.reply.content.slice(0, pending.visible),
        blocks: undefined,
        actions: undefined,
        stopped: true,
      });
    }
    setPending(null);
  }, [pending, append, updateMessage]);

  const onAction = useCallback(
    (message: AiMessage, action: AiAction) => {
      if (action.kind === "navigate") {
        navigate(action.href);
        return;
      }
      if (action.kind === "prompt") {
        send(action.prompt);
        return;
      }
      if (!active || pending) return;
      const leads = action.leadIds.map((id) => state.leads.find((l) => l.id === id)).filter((l) => l !== undefined);
      if (leads.length === 0) {
        toast({ title: "Those leads no longer exist", variant: "warning" });
        return;
      }
      const at = Date.now();
      const due = dueFromOption("today", at);
      leads.forEach((lead) => actions.addTask(lead.id, `Follow up with ${lead.name.split(" ")[0]}`, due, lead.ownerId));
      updateMessage(active.id, message.id, { completedActions: [...(message.completedActions ?? []), action.id] });
      toast({
        title: `${leads.length} follow-up ${leads.length === 1 ? "task" : "tasks"} created`,
        description: "Assigned to each lead's owner, due today.",
        variant: "success",
      });
      queueReply(active.id, followUpConfirmation(leads.length, at), 700);
    },
    [active, pending, state.leads, actions, updateMessage, toast, queueReply, navigate, send],
  );

  const deleteConversation = useCallback(
    (id: string) => {
      const conversation = conversations.find((c) => c.id === id);
      if (!conversation) return;
      if (pending?.convId === id) setPending(null);
      remove(id);
      if (activeId === id) setParams({});
      toast({
        title: "Conversation deleted",
        description: conversation.title,
        action: { label: "Undo", onClick: () => restore(conversation) },
      });
    },
    [conversations, pending, remove, activeId, setParams, toast, restore],
  );

  /* Keep the latest message in view unless the reader scrolled up. */
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = activeId ? el.scrollHeight : 0;
    stickToBottom.current = true;
  }, [activeId]);

  const lastLength = active?.messages.length ?? 0;
  useEffect(() => {
    const el = scrollRef.current;
    if (el && activeId && stickToBottom.current) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [lastLength, pending?.phase, pending?.visible, activeId]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId]);

  const busy = pending !== null;
  const firstName = user.name.split(" ")[0];

  const list = (
    <ConversationList
      conversations={conversations}
      activeId={active?.id ?? null}
      now={now}
      onSelect={selectConversation}
      onNew={() => selectConversation(null)}
      onRename={rename}
      onDelete={deleteConversation}
    />
  );

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-hairline bg-white/40 md:flex">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          <h2 className="text-sm font-semibold text-ink">AI Conversations</h2>
          <span className="rounded-full bg-sunken px-2 py-0.5 font-mono text-2xs tabular-nums text-muted">{conversations.length}</span>
        </div>
        {list}
      </aside>

      <Drawer open={history.isOpen} onClose={history.close} side="left" size="xs" title="AI Conversations">
        <div className="-mx-6 -my-5 flex h-[calc(100%+2.5rem)] flex-col">{list}</div>
      </Drawer>

      <section className="flex min-w-0 flex-1 flex-col bg-white/25">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-hairline bg-white/50 px-3 backdrop-blur-md sm:px-5">
          <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={history.open} aria-label="Show conversations">
            <PanelLeft />
          </Button>
          <AssistantMark />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-wide text-ink">NEXORA AI</h1>
              <Tooltip content="Replies are simulated from your workspace data. No AI model is connected.">
                <Badge variant="accent" size="sm">
                  Demo mode
                </Badge>
              </Tooltip>
            </div>
            <p className="truncate text-xs text-muted">{active ? active.title : "Your sales assistant"}</p>
          </div>
          {active && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<MessageSquarePlus />}
              onClick={() => selectConversation(null)}
              aria-label="New chat"
            >
              <span className="hidden sm:inline">New chat</span>
            </Button>
          )}
        </header>

        <div ref={scrollRef} onScroll={onScroll} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
            {active ? (
              <div className="space-y-6">
                <AnimatePresence initial={false}>
                  {active.messages.map((message) => (
                    <MessageRow
                      key={message.id}
                      message={message}
                      userName={user.name}
                      now={now}
                      visible={pending?.phase === "streaming" && pending.messageId === message.id ? pending.visible : undefined}
                      onAction={onAction}
                      busy={busy}
                    />
                  ))}
                  {pending?.phase === "thinking" && pending.convId === active.id && <TypingIndicator key="typing" />}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-2 sm:py-6">
                <AssistantMark className="size-10 rounded-xl [&_svg]:size-5" />
                <h2 className="type-h2 mt-4">
                  {greeting(now)}, {firstName}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Here's what stands out in your workspace. Pick an insight or ask a question below.
                </p>
                <div className="mt-6">
                  <InsightCards now={now} onAsk={(prompt) => send(prompt)} disabled={busy} />
                </div>
                <p className="type-overline mt-8 text-subtle">Try asking</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={busy}
                      onClick={() => send(prompt)}
                      className="rounded-full border border-hairline bg-white/75 px-3 py-1.5 text-xs text-ink shadow-xs transition-colors hover:border-primary/25 hover:bg-white disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 px-3 pb-3 pt-2 sm:px-6 sm:pb-4">
          <div className="mx-auto w-full max-w-3xl">
            <ChatInput ref={inputRef} busy={busy} onSend={send} onStop={stop} />
          </div>
        </div>
      </section>
    </div>
  );
}
