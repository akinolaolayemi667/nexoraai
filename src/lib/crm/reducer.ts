import { ownerById, stageMeta, statusMeta } from "./constants";
import type { Activity, CrmState, Deal, DealStage, Lead, Message, Note, Task } from "./types";

export type LeadPatch = Partial<Pick<Lead, "status" | "ownerId">>;
export type DealPatch = Partial<Pick<Deal, "name" | "company" | "value" | "probability" | "ownerId" | "expectedClose" | "contactId">>;

export type CrmAction =
  | { type: "leads/update"; ids: string[]; patch: LeadPatch; at: number; actor: string }
  | { type: "leads/delete"; ids: string[] }
  | { type: "leads/add"; lead: Lead; actor: string }
  | { type: "notes/add"; note: Note }
  | { type: "notes/delete"; id: string }
  | { type: "tasks/add"; task: Task }
  | { type: "tasks/toggle"; id: string; at: number; actor: string }
  | { type: "tasks/delete"; id: string }
  | { type: "activity/log"; activity: Activity }
  | { type: "threads/reply"; threadId: string; leadId: string; message: Message }
  | { type: "deals/move"; id: string; stage: DealStage; beforeId: string | null; at: number; actor: string }
  | { type: "deals/add"; deal: Deal; actor: string }
  | { type: "deals/update"; id: string; patch: DealPatch; at: number }
  | { type: "deals/delete"; id: string }
  | { type: "reset"; state: CrmState };

let counter = 0;
export const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}`;

function touch(leads: Lead[], leadId: string | null, text: string, at: number) {
  if (!leadId) return leads;
  return leads.map((lead) =>
    lead.id === leadId && at >= lead.lastActivityAt ? { ...lead, lastActivity: text, lastActivityAt: at } : lead,
  );
}

function activity(leadId: string, type: Activity["type"], title: string, at: number, actor: string, detail?: string): Activity {
  return { id: uid("ac"), leadId, type, title, detail, actor, at };
}

export function crmReducer(state: CrmState, action: CrmAction): CrmState {
  switch (action.type) {
    case "leads/update": {
      const ids = new Set(action.ids);
      const added: Activity[] = [];
      const leads = state.leads.map((lead) => {
        if (!ids.has(lead.id)) return lead;
        const next = { ...lead, ...action.patch };
        if (action.patch.status && action.patch.status !== lead.status) {
          const title = `Status changed to ${statusMeta[action.patch.status].label}`;
          added.push(activity(lead.id, "status", title, action.at, action.actor, `Was ${statusMeta[lead.status].label}`));
          Object.assign(next, { lastActivity: title, lastActivityAt: action.at });
        }
        if (action.patch.ownerId && action.patch.ownerId !== lead.ownerId) {
          added.push(activity(lead.id, "status", `Owner changed to ${ownerById(action.patch.ownerId).name}`, action.at, action.actor));
        }
        return next;
      });
      return { ...state, leads, activities: [...state.activities, ...added] };
    }

    case "leads/delete": {
      const ids = new Set(action.ids);
      return {
        ...state,
        leads: state.leads.filter((l) => !ids.has(l.id)),
        notes: state.notes.filter((n) => !ids.has(n.leadId)),
        tasks: state.tasks.filter((t) => !ids.has(t.leadId)),
        activities: state.activities.filter((a) => !ids.has(a.leadId)),
        deals: state.deals.map((d) => (d.contactId && ids.has(d.contactId) ? { ...d, contactId: null } : d)),
      };
    }

    case "leads/add":
      return { ...state, leads: [action.lead, ...state.leads] };

    case "notes/add":
      return {
        ...state,
        notes: [action.note, ...state.notes],
        leads: touch(state.leads, action.note.leadId, "Note added", action.note.createdAt),
      };

    case "notes/delete":
      return { ...state, notes: state.notes.filter((n) => n.id !== action.id) };

    case "tasks/add":
      return {
        ...state,
        tasks: [...state.tasks, action.task],
        activities: [
          ...state.activities,
          activity(action.task.leadId, "task", `Task created: ${action.task.title}`, action.task.createdAt, ownerById(action.task.ownerId).name),
        ],
      };

    case "tasks/toggle": {
      const task = state.tasks.find((t) => t.id === action.id);
      if (!task) return state;
      const done = !task.done;
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, done } : t)),
        activities: done
          ? [...state.activities, activity(task.leadId, "task", `Completed task: ${task.title}`, action.at, action.actor)]
          : state.activities,
        leads: done ? touch(state.leads, task.leadId, "Completed a task", action.at) : state.leads,
      };
    }

    case "tasks/delete":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };

    case "activity/log":
      return {
        ...state,
        activities: [...state.activities, action.activity],
        leads: touch(state.leads, action.activity.leadId, action.activity.title, action.activity.at),
      };

    case "threads/reply":
      return {
        ...state,
        replies: { ...state.replies, [action.threadId]: [...(state.replies[action.threadId] ?? []), action.message] },
        activities: [
          ...state.activities,
          activity(action.leadId, "email", "Replied to conversation", action.message.at, action.message.author, action.message.body),
        ],
        leads: touch(state.leads, action.leadId, "Replied to conversation", action.message.at),
      };

    case "deals/move": {
      const deal = state.deals.find((d) => d.id === action.id);
      if (!deal) return state;
      const stageChanged = deal.stage !== action.stage;
      const moved: Deal = stageChanged
        ? {
            ...deal,
            stage: action.stage,
            probability: stageMeta[action.stage].probability,
            lastActivityAt: action.at,
            closedAt: action.stage === "won" || action.stage === "lost" ? action.at : undefined,
          }
        : deal;

      const rest = state.deals.filter((d) => d.id !== action.id);
      let index = action.beforeId ? rest.findIndex((d) => d.id === action.beforeId) : -1;
      if (index === -1) {
        let lastInStage = -1;
        rest.forEach((d, i) => {
          if (d.stage === action.stage) lastInStage = i;
        });
        index = lastInStage === -1 ? rest.length : lastInStage + 1;
      }
      const deals = [...rest.slice(0, index), moved, ...rest.slice(index)];
      if (!stageChanged) return { ...state, deals };

      const title = `Deal moved to ${stageMeta[action.stage].label}`;
      let leads = touch(state.leads, deal.contactId, title, action.at);
      if (action.stage === "won" && deal.contactId) {
        leads = leads.map((l) => (l.id === deal.contactId ? { ...l, status: "won" as const } : l));
      }
      return {
        ...state,
        deals,
        leads,
        activities: deal.contactId
          ? [...state.activities, activity(deal.contactId, "deal", title, action.at, action.actor, deal.name)]
          : state.activities,
      };
    }

    case "deals/add": {
      const { deal } = action;
      const title = `Deal created: ${deal.name}`;
      return {
        ...state,
        deals: [...state.deals, deal],
        leads: touch(state.leads, deal.contactId, title, deal.createdAt),
        activities: deal.contactId
          ? [...state.activities, activity(deal.contactId, "deal", title, deal.createdAt, action.actor, `${stageMeta[deal.stage].label} stage`)]
          : state.activities,
      };
    }

    case "deals/update":
      return {
        ...state,
        deals: state.deals.map((d) => (d.id === action.id ? { ...d, ...action.patch, lastActivityAt: action.at } : d)),
      };

    case "deals/delete":
      return { ...state, deals: state.deals.filter((d) => d.id !== action.id) };

    case "reset":
      return action.state;
  }
}
