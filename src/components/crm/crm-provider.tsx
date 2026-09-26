import { useEffect, useMemo, useReducer, type ReactNode } from "react";
import { useUser } from "@/lib/auth/auth-context";
import { CrmContext, type CrmActions } from "@/lib/crm/crm-context";
import { crmReducer, uid } from "@/lib/crm/reducer";
import { CRM_VERSION, createSeed, domainFor } from "@/lib/crm/seed";
import type { CrmState, LeadSource } from "@/lib/crm/types";

const storageKey = (userId: string) => `nexora:crm:v${CRM_VERSION}:${userId}`;

function load(userId: string): CrmState {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw) as CrmState;
      if (parsed.version === CRM_VERSION && Array.isArray(parsed.leads)) return parsed;
    }
  } catch {
    // Corrupt or unavailable storage falls back to fresh demo data.
  }
  return createSeed();
}

const sourceBonus: Record<LeadSource, number> = { referral: 14, organic: 9, events: 5, paid: 2, social: -3 };

function Provider({ userId, actor, children }: { userId: string; actor: string; children: ReactNode }) {
  const [state, dispatch] = useReducer(crmReducer, userId, load);

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

  const actions = useMemo<CrmActions>(
    () => ({
      updateLeads: (ids, patch) => dispatch({ type: "leads/update", ids, patch, at: Date.now(), actor }),
      deleteLeads: (ids) => dispatch({ type: "leads/delete", ids }),
      addLead: (input) => {
        const now = Date.now();
        const lead = {
          ...input,
          id: uid("ld"),
          location: "",
          website: domainFor(input.company),
          score: Math.min(99, Math.max(20, 48 + sourceBonus[input.source] + (input.title ? 6 : 0) + (input.phone ? 4 : 0))),
          lastActivity: "Added manually",
          lastActivityAt: now,
          createdAt: now,
        };
        dispatch({ type: "leads/add", lead, actor });
        return lead;
      },
      addNote: (leadId, body) =>
        dispatch({ type: "notes/add", note: { id: uid("nt"), leadId, body, author: actor, createdAt: Date.now() } }),
      deleteNote: (id) => dispatch({ type: "notes/delete", id }),
      addTask: (leadId, title, dueAt, ownerId) =>
        dispatch({
          type: "tasks/add",
          task: { id: uid("tk"), leadId, title, dueAt, ownerId, done: false, createdAt: Date.now() },
        }),
      toggleTask: (id) => dispatch({ type: "tasks/toggle", id, at: Date.now(), actor }),
      deleteTask: (id) => dispatch({ type: "tasks/delete", id }),
      logActivity: (leadId, type, title, detail) =>
        dispatch({ type: "activity/log", activity: { id: uid("ac"), leadId, type, title, detail, actor, at: Date.now() } }),
      reply: (leadId, threadId, body) =>
        dispatch({
          type: "threads/reply",
          leadId,
          threadId,
          message: { id: uid("msg"), direction: "outbound", author: actor, body, at: Date.now() },
        }),
      moveDeal: (id, stage, beforeId) => dispatch({ type: "deals/move", id, stage, beforeId, at: Date.now(), actor }),
      addDeal: (input) => {
        const now = Date.now();
        const deal = {
          ...input,
          id: uid("dl"),
          lastActivityAt: now,
          createdAt: now,
          closedAt: input.stage === "won" || input.stage === "lost" ? now : undefined,
        };
        dispatch({ type: "deals/add", deal, actor });
        return deal;
      },
      updateDeal: (id, patch) => dispatch({ type: "deals/update", id, patch, at: Date.now() }),
      deleteDeal: (id) => dispatch({ type: "deals/delete", id }),
      reset: () => dispatch({ type: "reset", state: createSeed() }),
    }),
    [actor],
  );

  const value = useMemo(() => ({ state, actions, actor }), [state, actions, actor]);
  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function CrmProvider({ children }: { children: ReactNode }) {
  const user = useUser();
  return (
    <Provider key={user.id} userId={user.id} actor={user.name}>
      {children}
    </Provider>
  );
}
