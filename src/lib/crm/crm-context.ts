import { createContext, useContext } from "react";
import type { DealPatch, LeadPatch, TaskPatch } from "./reducer";
import type { ActivityType, CrmState, Deal, DealStage, Lead, LeadSource, LeadStatus, TaskPriority, TaskStatus } from "./types";

export type NewLeadInput = {
  name: string;
  email: string;
  company: string;
  title: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  ownerId: string;
};

export type NewDealInput = {
  name: string;
  company: string;
  contactId: string | null;
  value: number;
  probability: number;
  stage: DealStage;
  ownerId: string;
  expectedClose: string;
};

export type CrmActions = {
  updateLeads: (ids: string[], patch: LeadPatch) => void;
  deleteLeads: (ids: string[]) => void;
  addLead: (input: NewLeadInput) => Lead;
  addNote: (leadId: string, body: string) => void;
  deleteNote: (id: string) => void;
  addTask: (
    leadId: string,
    title: string,
    dueAt: number,
    ownerId: string,
    extra?: { priority?: TaskPriority; status?: Exclude<TaskStatus, "done"> },
  ) => void;
  updateTask: (id: string, patch: TaskPatch) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  logActivity: (leadId: string, type: ActivityType, title: string, detail?: string) => void;
  reply: (leadId: string, threadId: string, body: string) => void;
  moveDeal: (id: string, stage: DealStage, beforeId: string | null) => void;
  addDeal: (input: NewDealInput) => Deal;
  updateDeal: (id: string, patch: DealPatch) => void;
  deleteDeal: (id: string) => void;
  reset: () => void;
};

export type CrmContextValue = { state: CrmState; actions: CrmActions; actor: string };

export const CrmContext = createContext<CrmContextValue | null>(null);

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) throw new Error("useCrm must be used inside <CrmProvider>");
  return context;
}
