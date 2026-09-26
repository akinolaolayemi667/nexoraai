import { ownerById } from "@/lib/crm/constants";
import { hashString, mulberry32 } from "@/lib/crm/seed";
import type { Lead } from "@/lib/crm/types";
import { formatCurrency } from "@/lib/format";
import type { StepContext, WorkflowInfo } from "./catalog";
import type { NodeType, RunRecord } from "./types";

export type ExecutionStep = {
  label: string;
  type: NodeType;
  detail: string;
  status: "success" | "failed" | "skipped";
  at: number | null;
  durationMs: number;
  error?: string;
};

export type Execution = {
  id: string;
  workflowId: string;
  workflowName: string;
  leadId: string;
  leadName: string;
  startedAt: number;
  finishedAt: number;
  status: "success" | "failed";
  steps: ExecutionStep[];
  retryOf?: string;
};

const MINUTE = 60_000;

function contextFor(lead: Lead, rng: () => number): StepContext {
  return {
    lead: lead.name,
    first: lead.name.split(" ")[0],
    company: lead.company,
    email: lead.email,
    owner: ownerById(lead.ownerId).name,
    score: lead.score >= 70 ? lead.score : 72 + Math.floor(rng() * 24),
    value: formatCurrency(Math.round((4 + rng() * 40) * 500)),
  };
}

export const runNumber = (execution: Execution) => `#${(hashString(execution.id) % 90000) + 10000}`;

export function buildExecution(
  workflow: WorkflowInfo,
  lead: Lead,
  finishedAt: number,
  failAt: number | null,
  rng: () => number,
  id: string,
): Execution {
  const ctx = contextFor(lead, rng);
  const durations = workflow.steps.map((step) => Math.round(step.ms[0] + rng() * (step.ms[1] - step.ms[0])));
  const lastIndex = failAt ?? workflow.steps.length - 1;
  const total = durations.slice(0, lastIndex + 1).reduce((a, b) => a + b, 0);
  const startedAt = finishedAt - total;
  let t = startedAt;
  const steps = workflow.steps.map((spec, i): ExecutionStep => {
    if (i > lastIndex) return { label: spec.label, type: spec.type, detail: spec.node, status: "skipped", at: null, durationMs: 0 };
    const at = t;
    t += durations[i];
    const failed = i === failAt;
    return {
      label: spec.label,
      type: spec.type,
      detail: failed ? spec.node : spec.detail(ctx),
      status: failed ? "failed" : "success",
      at,
      durationMs: durations[i],
      error: failed ? spec.error : undefined,
    };
  });
  return {
    id,
    workflowId: workflow.id,
    workflowName: workflow.name,
    leadId: lead.id,
    leadName: lead.name,
    startedAt,
    finishedAt,
    status: failAt === null ? "success" : "failed",
    steps,
  };
}

const failableSteps = (workflow: WorkflowInfo) =>
  workflow.steps.map((s, i) => (s.error ? i : -1)).filter((i) => i >= 0);

/** Recent executions for today's runs, reproducible for a given day and set of leads. */
export function generateExecutions(list: WorkflowInfo[], leads: Lead[], now: number) {
  const day = new Date(now).toDateString();
  const pool = leads.filter((l) => l.status !== "lost");
  const result: Execution[] = [];
  list.forEach((workflow) => {
    if (workflow.runsToday === 0 || pool.length === 0) return;
    const rng = mulberry32(hashString(`${day}:${workflow.id}`));
    const count = Math.min(12, Math.max(1, Math.ceil(workflow.runsToday / 36)));
    const spacing = (24 * 60) / workflow.runsToday;
    const failChance = workflow.failedToday / workflow.runsToday;
    let finished = now - workflow.lastRunMinutes * MINUTE - rng() * 40_000;
    const failable = failableSteps(workflow);
    for (let i = 0; i < count; i++) {
      const lead = pool[Math.floor(rng() * pool.length)];
      const fails = failable.length > 0 && workflow.failedToday > 0 && (i === 2 || rng() < failChance * 2);
      const failAt = fails ? failable[Math.floor(rng() * failable.length)] : null;
      result.push(buildExecution(workflow, lead, finished, failAt, rng, `ex_${workflow.id}_${i}`));
      finished -= Math.max(1, spacing * (0.6 + rng() * 0.8)) * MINUTE;
    }
  });
  return result.sort((a, b) => b.finishedAt - a.finishedAt);
}

export function toRunRecord(execution: Execution): RunRecord {
  const cond = execution.steps.find((s) => s.type === "condition");
  return {
    id: execution.id,
    at: execution.finishedAt,
    ok: execution.status === "success",
    durationMs: execution.finishedAt - execution.startedAt,
    lead: execution.leadName,
    branch: cond ? "yes" : null,
    steps: execution.steps.filter((s) => s.status !== "skipped").length,
  };
}

/** Runs per hour over the last 24 hours, summing to today's totals. */
export function hourlyRuns(total: number, failed: number, now: number, distributeFn: (t: number, w: number[]) => number[]) {
  const end = new Date(now);
  end.setMinutes(0, 0, 0);
  const hours = Array.from({ length: 24 }, (_, i) => new Date(end.getTime() - (23 - i) * 3600_000));
  const weights = hours.map((d, i) => {
    const h = d.getHours();
    const business = h >= 8 && h <= 18 ? 1 : h >= 6 && h <= 21 ? 0.55 : 0.18;
    return business * (0.8 + 0.4 * Math.abs(Math.sin(i * 1.7)));
  });
  const runs = distributeFn(total, weights);
  const fails = distributeFn(failed, runs.map((r, i) => r * (0.6 + 0.8 * Math.abs(Math.cos(i * 2.3)))));
  const label = new Intl.DateTimeFormat("en-US", { hour: "numeric" });
  return hours.map((d, i) => ({ label: label.format(d), successful: runs[i] - fails[i], failed: fails[i] }));
}
