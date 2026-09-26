import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/lib/auth/auth-context";
import { useCrm } from "@/lib/crm/crm-context";
import type { CrmState } from "@/lib/crm/types";
import { mockReply, titleFor } from "./engine";
import type { AiMessage, Conversation } from "./types";

const storageKey = (userId: string) => `nexora:ai:v1:${userId}`;

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

let counter = 0;
export const aiId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}`;

function exchange(prompt: string, state: CrmState, at: number): AiMessage[] {
  return [
    { id: aiId("msg"), role: "user", content: prompt, at },
    { id: aiId("msg"), role: "assistant", at: at + 4000, ...mockReply(prompt, state, [], at) },
  ];
}

function seed(state: CrmState): Conversation[] {
  const now = Date.now();
  const make = (prompts: string[], ago: number): Conversation => {
    const start = now - ago;
    const messages = prompts.flatMap((p, i) => exchange(p, state, start + i * 3 * MINUTE));
    return {
      id: aiId("conv"),
      title: titleFor(prompts[0]),
      createdAt: start,
      updatedAt: messages.at(-1)!.at,
      messages,
    };
  };
  return [
    make(["Which leads should I follow up with today?"], 25 * MINUTE),
    make(["Which deals are at risk this week?", "Draft a check-in email for Aurora Retail"], DAY + 3 * 60 * MINUTE),
    make(["Summarize Acme Corp"], 3 * DAY),
    make(["What should I automate next?"], 6 * DAY),
  ];
}

function load(userId: string, state: CrmState): Conversation[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw) as Conversation[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fall through to fresh demo conversations.
  }
  return seed(state);
}

export function useConversations() {
  const user = useUser();
  const { state } = useCrm();
  const [conversations, setConversations] = useState<Conversation[]>(() => load(user.id, state));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey(user.id), JSON.stringify(conversations));
      } catch {
        // Storage unavailable: history stays in memory for this session.
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [conversations, user.id]);

  const create = useCallback((firstMessage: AiMessage) => {
    const conversation: Conversation = {
      id: aiId("conv"),
      title: titleFor(firstMessage.content || firstMessage.attachments?.[0]?.name || "New conversation"),
      createdAt: firstMessage.at,
      updatedAt: firstMessage.at,
      messages: [firstMessage],
    };
    setConversations((list) => [conversation, ...list]);
    return conversation.id;
  }, []);

  const append = useCallback((id: string, message: AiMessage) => {
    setConversations((list) =>
      list.map((c) => (c.id === id ? { ...c, messages: [...c.messages, message], updatedAt: message.at } : c)),
    );
  }, []);

  const updateMessage = useCallback((id: string, messageId: string, patch: Partial<AiMessage>) => {
    setConversations((list) =>
      list.map((c) =>
        c.id === id ? { ...c, messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)) } : c,
      ),
    );
  }, []);

  const rename = useCallback((id: string, title: string) => {
    setConversations((list) => list.map((c) => (c.id === id ? { ...c, title } : c)));
  }, []);

  const remove = useCallback((id: string) => {
    setConversations((list) => list.filter((c) => c.id !== id));
  }, []);

  const restore = useCallback((conversation: Conversation) => {
    setConversations((list) =>
      list.some((c) => c.id === conversation.id) ? list : [...list, conversation].sort((a, b) => b.updatedAt - a.updatedAt),
    );
  }, []);

  return { conversations, create, append, updateMessage, rename, remove, restore };
}
