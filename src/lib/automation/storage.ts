import type { Lead } from "@/lib/crm/types";
import { docFor, type WorkflowInfo } from "./catalog";
import { generateExecutions, toRunRecord } from "./executions";
import type { WorkflowDoc, WorkflowStats } from "./types";

export type StoredWorkflow = { saved: WorkflowDoc; savedAt: number | null; stats: WorkflowStats };

const storageKey = (userId: string, workflowId: string) => `nexora:automation:v2:${userId}:${workflowId}`;

export function readStored(userId: string, workflowId: string): StoredWorkflow | null {
  try {
    const raw = localStorage.getItem(storageKey(userId, workflowId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredWorkflow;
    return parsed.saved && Array.isArray(parsed.saved.nodes) && parsed.stats ? parsed : null;
  } catch {
    return null;
  }
}

export function writeStored(userId: string, workflowId: string, value: StoredWorkflow) {
  try {
    localStorage.setItem(storageKey(userId, workflowId), JSON.stringify(value));
  } catch {
    // Storage unavailable: changes last for this session only.
  }
}

export function defaultStored(workflow: WorkflowInfo, leads: Lead[], now = Date.now()): StoredWorkflow {
  const rate = workflow.runsToday ? 1 - workflow.failedToday / workflow.runsToday : 0.972;
  const runs = workflow.status === "draft" ? 0 : Math.round(Math.max(1, workflow.runsToday) * 37 + 180);
  return {
    saved: docFor(workflow),
    savedAt: null,
    stats: {
      runs,
      successes: Math.round(runs * rate),
      lastRunAt: workflow.lastRunMinutes >= 0 ? now - workflow.lastRunMinutes * 60_000 : null,
      history: generateExecutions([workflow], leads, now).slice(0, 8).map(toRunRecord),
    },
  };
}
