import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { createInbox, INBOX_VERSION, type InboxConversation, type InboxState } from "./data";

type Action =
  | { type: "read"; id: string }
  | { type: "unread"; id: string }
  | { type: "status"; id: string; status: InboxConversation["status"] }
  | { type: "assign"; id: string; assigneeId: string | null }
  | { type: "send"; id: string; body: string; author: string; at: number };

let counter = 0;

function reducer(state: InboxState, action: Action): InboxState {
  const update = (fn: (c: InboxConversation) => InboxConversation) => ({
    ...state,
    conversations: state.conversations.map((c) => (c.id === action.id ? fn(c) : c)),
  });
  switch (action.type) {
    case "read":
      return update((c) => (c.unread ? { ...c, unread: 0 } : c));
    case "unread":
      return update((c) => ({ ...c, unread: Math.max(1, c.unread) }));
    case "status":
      return update((c) => ({ ...c, status: action.status }));
    case "assign":
      return update((c) => ({ ...c, assigneeId: action.assigneeId }));
    case "send":
      return update((c) => ({
        ...c,
        status: "open",
        unread: 0,
        messages: [...c.messages, { id: `msg_${action.at.toString(36)}${(counter++).toString(36)}`, from: "agent", author: action.author, body: action.body, at: action.at }],
      }));
  }
}

const storageKey = (userId: string) => `nexora:inbox:v${INBOX_VERSION}:${userId}`;
const UNREAD_EVENT = "nexora:inbox-unread";

const unreadTotal = (conversations: InboxConversation[]) => conversations.reduce((sum, c) => sum + c.unread, 0);

function load(userId: string): InboxState {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw) as InboxState;
      if (parsed.version === INBOX_VERSION && Array.isArray(parsed.conversations)) return parsed;
    }
  } catch {
    // Unreadable storage falls back to fresh demo conversations.
  }
  return createInbox();
}

export function useInbox(userId: string, actor: string) {
  const [state, dispatch] = useReducer(reducer, userId, load);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey(userId), JSON.stringify(state));
      } catch {
        // Storage full or blocked: keep working in memory.
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [state, userId]);

  const unread = unreadTotal(state.conversations);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(UNREAD_EVENT, { detail: unread }));
  }, [unread]);

  const markRead = useCallback((id: string) => dispatch({ type: "read", id }), []);
  const actions = useMemo(
    () => ({
      markRead,
      markUnread: (id: string) => dispatch({ type: "unread", id }),
      setStatus: (id: string, status: InboxConversation["status"]) => dispatch({ type: "status", id, status }),
      assign: (id: string, assigneeId: string | null) => dispatch({ type: "assign", id, assigneeId }),
      send: (id: string, body: string) => dispatch({ type: "send", id, body, author: actor, at: Date.now() }),
    }),
    [actor, markRead],
  );

  return { conversations: state.conversations, actions };
}

/** Unread message count for nav badges, kept in sync with any mounted inbox. */
export function useInboxUnread(userId: string) {
  const [count, setCount] = useState(() => unreadTotal(load(userId).conversations));

  useEffect(() => {
    setCount(unreadTotal(load(userId).conversations));
    const onUnread = (e: Event) => setCount((e as CustomEvent<number>).detail);
    window.addEventListener(UNREAD_EVENT, onUnread);
    return () => window.removeEventListener(UNREAD_EVENT, onUnread);
  }, [userId]);

  return count;
}
