import { distribute } from "@/lib/distribute";
import { nodeMeta } from "./nodes";
import type { FlowEdge, FlowNode, NodeType, WorkflowDoc, WorkflowStatus } from "./types";
import { templateDoc } from "./workflow";

/* Steps --------------------------------------------------------------------- */

export type StepContext = { lead: string; first: string; company: string; email: string; owner: string; score: number; value: string };

export type StepSpec = {
  type: NodeType;
  /** Label shown in execution timelines, e.g. "Email Sent". */
  label: string;
  /** Title of the matching node in the builder. */
  node: string;
  config?: Record<string, string>;
  detail: (c: StepContext) => string;
  ms: [number, number];
  error?: string;
};

const HOUR = 3600_000;

const s = {
  aiQualify: {
    type: "ai",
    label: "AI Qualification",
    node: "AI qualification",
    detail: (c) => `Scored ${c.score}/100 · passed the lead score ≥ 70 check`,
    ms: [900, 2300],
    error: "Qualification step timed out after 30 seconds",
  },
  assign: {
    type: "crm",
    label: "CRM Update",
    node: "Assign owner",
    detail: (c) => `Assigned to ${c.owner} · status set to Qualified`,
    ms: [140, 420],
    error: "Owner has reached the limit of 40 open leads",
  },
  welcomeEmail: {
    type: "communication",
    label: "Email Sent",
    node: "Send email",
    config: { channel: "email", template: "Welcome · book a demo" },
    detail: (c) => `“Welcome · book a demo” to ${c.email}`,
    ms: [320, 900],
    error: "Recipient server rejected the message (550 mailbox unavailable)",
  },
  introTask: {
    type: "task",
    label: "Task Created",
    node: "Create task",
    config: { task: "Intro call", due: "today" },
    detail: (c) => `Intro call for ${c.owner} · due today`,
    ms: [80, 240],
  },
} satisfies Record<string, StepSpec>;

function trigger(label: string, detail: StepSpec["detail"], event = label): StepSpec {
  return { type: "trigger", label: "Trigger", node: label, config: { event, source: "any" }, detail, ms: [30, 110] };
}

const templates = {
  qualification: [
    trigger("New lead", (c) => `${c.lead} from ${c.company} created a lead`, "lead.created"),
    s.aiQualify,
    s.assign,
    s.welcomeEmail,
    s.introTask,
  ],
  welcome: [
    trigger("Deal marked won", (c) => `${c.company} closed for ${c.value}`),
    { type: "ai", label: "AI Summary", node: "Onboarding brief", config: { action: "summarize" }, detail: () => "Onboarding brief written from 6 notes and 3 calls", ms: [1100, 2400], error: "Summary step timed out after 30 seconds" },
    { type: "crm", label: "CRM Update", node: "Mark as customer", config: { action: "status" }, detail: () => "Status set to Customer · deal linked to account", ms: [120, 380] },
    { type: "communication", label: "Email Sent", node: "Welcome email", config: { channel: "email", template: "Welcome aboard" }, detail: (c) => `“Welcome aboard” to ${c.email}`, ms: [300, 850], error: "Recipient server rejected the message (550 mailbox unavailable)" },
    { type: "task", label: "Task Created", node: "Kickoff call", config: { task: "Kickoff call", due: "3d" }, detail: (c) => `Kickoff call for ${c.owner} · due in 3 days`, ms: [80, 220] },
  ],
  reminder: [
    trigger("Meeting booked", (c) => `Demo with ${c.owner} booked by ${c.lead}`),
    { type: "delay", label: "Delay", node: "Wait until day before", config: { amount: "1", unit: "days" }, detail: () => "Resumed 24 hours before the meeting", ms: [20 * HOUR, 23 * HOUR] },
    { type: "communication", label: "SMS Sent", node: "SMS reminder", config: { channel: "sms", template: "Meeting tomorrow" }, detail: (c) => `Reminder sent to ${c.first}'s mobile`, ms: [250, 700], error: "Carrier rejected the message (number unreachable)" },
    { type: "communication", label: "Email Sent", node: "Agenda email", config: { channel: "email", template: "Agenda and calendar link" }, detail: (c) => `Agenda and calendar link to ${c.email}`, ms: [300, 800] },
  ],
  recovery: [
    trigger("Daily at 9:00 AM", () => "Scheduled daily scan of inactive leads", "schedule.daily"),
    { type: "condition", label: "Condition", node: "Inactive 14+ days", config: { field: "score", operator: "gte", value: "40" }, detail: () => "Matched · no activity for 18 days", ms: [60, 180] },
    { type: "ai", label: "AI Draft", node: "Draft re-engagement", config: { action: "draft" }, detail: (c) => `Personalised check-in drafted for ${c.first}`, ms: [1200, 2600], error: "Draft step timed out after 30 seconds" },
    { type: "communication", label: "Email Sent", node: "Send check-in", config: { channel: "email", template: "Still interested?" }, detail: (c) => `“Still interested?” to ${c.email}`, ms: [300, 900] },
    { type: "task", label: "Task Created", node: "Owner follow-up", config: { task: "Call if no reply", due: "3d" }, detail: (c) => `Call ${c.first} if no reply · ${c.owner}`, ms: [80, 220] },
  ],
  alert: [
    trigger("Signal detected", (c) => `${c.lead} at ${c.company} crossed the alert threshold`),
    { type: "ai", label: "AI Summary", node: "Summarize context", config: { action: "summarize" }, detail: () => "Context summary written from recent activity", ms: [800, 1900], error: "Summary step timed out after 30 seconds" },
    { type: "communication", label: "Slack Message", node: "Post to Slack", config: { channel: "slack", template: "#sales-alerts" }, detail: (c) => `Posted to #sales-alerts and mentioned ${c.owner}`, ms: [200, 600], error: "Slack returned channel_not_found" },
  ],
  followup: [
    trigger("Event received", (c) => `${c.lead} triggered the workflow`),
    { type: "delay", label: "Delay", node: "Wait 2 hours", config: { amount: "2", unit: "hours" }, detail: () => "Resumed after 2 hours", ms: [2 * HOUR, 2 * HOUR + 60_000] },
    { type: "communication", label: "Email Sent", node: "Follow-up email", config: { channel: "email", template: "Quick follow-up" }, detail: (c) => `“Quick follow-up” to ${c.email}`, ms: [300, 900], error: "Recipient server rejected the message (550 mailbox unavailable)" },
    { type: "task", label: "Task Created", node: "Owner task", config: { task: "Check reply", due: "1d" }, detail: (c) => `Check for a reply · ${c.owner}`, ms: [80, 220] },
  ],
  sync: [
    trigger("Record changed", (c) => `${c.company} record updated`),
    { type: "crm", label: "CRM Update", node: "Update fields", config: { action: "tag" }, detail: () => "3 fields updated · tag added", ms: [120, 380] },
    { type: "webhook", label: "Webhook", node: "Notify partner", config: { method: "POST", url: "https://hooks.partner-crm.com/nexora" }, detail: () => "POST hooks.partner-crm.com · 200 OK", ms: [250, 1200], error: "Endpoint returned 503 Service Unavailable after 3 retries" },
  ],
  triage: [
    trigger("Email received", (c) => `New message from ${c.lead}`),
    { type: "ai", label: "AI Classification", node: "Classify intent", config: { action: "classify" }, detail: () => "Classified as a billing question · high confidence", ms: [700, 1600], error: "Classification step timed out after 30 seconds" },
    { type: "crm", label: "CRM Update", node: "Route to queue", config: { action: "assign", assignee: "round-robin" }, detail: (c) => `Routed to ${c.owner}`, ms: [120, 380] },
    { type: "task", label: "Task Created", node: "Reply task", config: { task: "Reply to customer", due: "1h" }, detail: (c) => `Reply within 1 hour · ${c.owner}`, ms: [80, 220] },
  ],
} satisfies Record<string, StepSpec[]>;

export type TemplateId = keyof typeof templates;

/* Catalog ------------------------------------------------------------------- */

export type WorkflowInfo = {
  id: string;
  name: string;
  trigger: string;
  status: WorkflowStatus;
  template: TemplateId;
  runsToday: number;
  failedToday: number;
  lastRunMinutes: number;
  steps: StepSpec[];
};

type Entry = [id: string, name: string, trigger: string, status: WorkflowStatus, template: TemplateId, runWeight: number, failWeight: number, lastRunMinutes: number];

const entries: Entry[] = [
  ["lead-qualification", "Lead Qualification", "New lead created", "active", "qualification", 412, 6, 2],
  ["new-customer-welcome", "New Customer Welcome", "Deal marked won", "active", "welcome", 38, 0, 47],
  ["appointment-reminder", "Appointment Reminder", "Meeting booked", "active", "reminder", 164, 3, 6],
  ["inactive-lead-recovery", "Inactive Lead Recovery", "Daily at 9:00 AM", "paused", "recovery", 0, 0, 4320],
  ["demo-request-reply", "Demo Request Fast Reply", "Demo form submitted", "active", "followup", 96, 1, 11],
  ["lead-enrichment", "Lead Enrichment", "New lead created", "active", "sync", 326, 13, 2],
  ["hot-lead-alert", "Hot Lead Slack Alert", "Lead score reaches 80", "active", "alert", 58, 0, 18],
  ["deal-stage-updates", "Deal Stage Notifications", "Deal stage changed", "active", "alert", 121, 2, 9],
  ["proposal-follow-up", "Proposal Follow-up", "Proposal viewed", "active", "followup", 47, 1, 34],
  ["support-triage", "Support Ticket Triage", "Support email received", "active", "triage", 188, 5, 1],
  ["pricing-visit-nudge", "Pricing Page Nudge", "Pricing viewed twice", "active", "followup", 57, 2, 13],
  ["round-robin-assignment", "Round-robin Assignment", "Lead qualified", "active", "sync", 64, 0, 7],
  ["webinar-sync", "Webinar Registration Sync", "Webinar form submitted", "active", "sync", 73, 3, 26],
  ["sms-opt-in", "SMS Opt-in Confirmation", "SMS keyword received", "active", "followup", 44, 2, 15],
  ["invoice-reminder", "Invoice Reminder", "Invoice overdue", "active", "followup", 29, 2, 64],
  ["trial-expiry-nudge", "Trial Expiry Nudge", "Trial ends in 3 days", "active", "followup", 31, 1, 118],
  ["review-request", "Review Request", "14 days after deal won", "active", "followup", 22, 0, 73],
  ["event-lead-import", "Event Lead Import", "CSV file uploaded", "active", "sync", 18, 3, 52],
  ["churn-risk-alert", "Churn Risk Alert", "Health score drops", "active", "alert", 14, 0, 176],
  ["no-show-rescue", "Meeting No-show Rescue", "Meeting missed", "active", "followup", 12, 0, 131],
  ["renewal-reminder", "Renewal Reminder", "Renewal in 30 days", "active", "followup", 9, 0, 297],
  ["contract-handoff", "Contract Signed Handoff", "Contract signed", "active", "sync", 7, 0, 186],
  ["referral-thank-you", "Referral Thank-you", "Referral received", "active", "followup", 6, 0, 241],
  ["lost-deal-survey", "Lost Deal Survey", "Deal marked lost", "active", "followup", 5, 0, 352],
  ["weekly-digest", "Weekly Pipeline Digest", "Mondays at 8:00 AM", "active", "alert", 1, 0, 344],
  ["birthday-greetings", "Birthday Greetings", "Daily at 8:00 AM", "paused", "followup", 0, 0, 10080],
  ["partner-lead-routing", "Partner Lead Routing", "Partner lead received", "draft", "sync", 0, 0, -1],
];

export const RUNS_TODAY = 1842;
export const FAILED_TODAY = 44;

const runs = distribute(RUNS_TODAY, entries.map((e) => e[5]));
const failed = distribute(FAILED_TODAY, entries.map((e) => e[6]));

export const workflows: WorkflowInfo[] = entries.map(([id, name, triggerLabel, status, template, , , lastRunMinutes], i) => ({
  id,
  name,
  trigger: triggerLabel,
  status,
  template,
  runsToday: runs[i],
  failedToday: failed[i],
  lastRunMinutes,
  steps: (templates[template] as StepSpec[]).map((step, j) =>
    j === 0 ? { ...step, node: triggerLabel, config: { ...step.config, event: step.config?.event?.includes(".") ? step.config.event : triggerLabel } } : step,
  ),
}));

export const workflowById = (id: string | undefined) => workflows.find((w) => w.id === id);

/** Builder document for a workflow: the branching starter flow for lead qualification, a linear chain otherwise. */
export function docFor(workflow: WorkflowInfo): WorkflowDoc {
  if (workflow.template === "qualification") {
    return { ...templateDoc(), name: workflow.name, status: workflow.status };
  }
  const nodes: FlowNode[] = workflow.steps.map((step, i) => ({
    id: `n_${i}`,
    type: step.type,
    title: step.node,
    x: -120,
    y: i * 150,
    config: { ...nodeMeta[step.type].defaults.config, ...step.config },
  }));
  const edges: FlowEdge[] = [];
  nodes.forEach((node, i) => {
    const next = nodes[i + 1];
    if (!next) return;
    edges.push({ id: `e_${i}`, from: node.id, port: node.type === "condition" ? "yes" : "out", to: next.id });
  });
  return { name: workflow.name, status: workflow.status, nodes, edges };
}
