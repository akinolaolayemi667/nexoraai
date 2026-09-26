import { BrainCircuit, ListChecks, Mail, Split, Timer, UserCog, Webhook, Zap, type LucideIcon } from "lucide-react";
import { owners } from "@/lib/crm/constants";
import type { FlowNode, NodeType, Port } from "./types";

export const NODE_W = 240;
export const NODE_H = 88;

type Option = { value: string; label: string };

export type NodeField =
  | { key: string; label: string; kind: "select"; options: Option[] }
  | { key: string; label: string; kind: "text" | "textarea" | "number"; placeholder?: string; suffix?: string };

type NodeMeta = {
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  chip: string;
  fields: NodeField[];
  defaults: { title: string; config: Record<string, string> };
  summary: (config: Record<string, string>) => string;
};

const pick = (options: Option[], value: string | undefined) => options.find((o) => o.value === value)?.label ?? value ?? "";

export const triggerEvents: Option[] = [
  { value: "lead.created", label: "New lead created" },
  { value: "form.submitted", label: "Form submitted" },
  { value: "deal.stage", label: "Deal stage changed" },
  { value: "email.replied", label: "Email reply received" },
  { value: "schedule.daily", label: "Every day at 9:00 AM" },
];

const leadSources: Option[] = [
  { value: "any", label: "Any source" },
  { value: "organic", label: "Organic search" },
  { value: "referral", label: "Referral" },
  { value: "paid", label: "Paid ads" },
  { value: "events", label: "Events" },
];

const aiActions: Option[] = [
  { value: "qualify", label: "Qualify and score lead" },
  { value: "enrich", label: "Enrich company data" },
  { value: "summarize", label: "Summarize conversation" },
  { value: "classify", label: "Classify intent" },
  { value: "draft", label: "Draft a reply" },
];

export const conditionFields: Option[] = [
  { value: "score", label: "Lead score" },
  { value: "dealValue", label: "Deal value" },
  { value: "source", label: "Lead source" },
  { value: "company", label: "Company size" },
];

const operators: Option[] = [
  { value: "gte", label: "At least (≥)" },
  { value: "lte", label: "At most (≤)" },
  { value: "eq", label: "Equals (=)" },
];

const operatorSymbol: Record<string, string> = { gte: "≥", lte: "≤", eq: "=" };

const crmActions: Option[] = [
  { value: "assign", label: "Assign owner" },
  { value: "status", label: "Update lead status" },
  { value: "deal", label: "Create deal" },
  { value: "tag", label: "Add tag" },
];

const assignees: Option[] = [
  { value: "round-robin", label: "Round robin · Sales team" },
  { value: "lead-owner", label: "Lead owner" },
  ...owners.map((o) => ({ value: o.id, label: o.name })),
];

const channels: Option[] = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "slack", label: "Slack message" },
  { value: "sequence", label: "Email sequence" },
];

const dueOptions: Option[] = [
  { value: "1h", label: "In 1 hour" },
  { value: "today", label: "Today" },
  { value: "1d", label: "Tomorrow" },
  { value: "3d", label: "In 3 days" },
];

const units: Option[] = [
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
];

const methods: Option[] = ["POST", "PUT", "GET"].map((m) => ({ value: m, label: m }));

export const nodeMeta: Record<NodeType, NodeMeta> = {
  trigger: {
    label: "Trigger",
    description: "Starts the workflow",
    icon: Zap,
    color: "#2563eb",
    chip: "bg-primary-soft/60 text-primary ring-primary-border",
    fields: [
      { key: "event", label: "When", kind: "select", options: triggerEvents },
      { key: "source", label: "Source", kind: "select", options: leadSources },
    ],
    defaults: { title: "New lead", config: { event: "lead.created", source: "any" } },
    summary: (c) => `${pick(triggerEvents, c.event)}${c.source && c.source !== "any" ? ` · ${pick(leadSources, c.source)}` : ""}`,
  },
  ai: {
    label: "AI Action",
    description: "Qualify, enrich or draft",
    icon: BrainCircuit,
    color: "#4f46e5",
    chip: "bg-accent-soft text-accent ring-accent-border",
    fields: [
      { key: "action", label: "Action", kind: "select", options: aiActions },
      { key: "instructions", label: "Instructions", kind: "textarea", placeholder: "Describe what a good lead looks like…" },
    ],
    defaults: { title: "AI qualification", config: { action: "qualify", instructions: "Score fit, intent and budget from 0–100." } },
    summary: (c) => pick(aiActions, c.action),
  },
  condition: {
    label: "Condition",
    description: "Branch on a rule",
    icon: Split,
    color: "#d97706",
    chip: "bg-warning-soft text-warning-text ring-warning-border",
    fields: [
      { key: "field", label: "Field", kind: "select", options: conditionFields },
      { key: "operator", label: "Operator", kind: "select", options: operators },
      { key: "value", label: "Value", kind: "text", placeholder: "70" },
    ],
    defaults: { title: "Check score", config: { field: "score", operator: "gte", value: "70" } },
    summary: (c) => `${pick(conditionFields, c.field)} ${operatorSymbol[c.operator] ?? c.operator} ${c.value || "…"}`,
  },
  crm: {
    label: "CRM Action",
    description: "Update records",
    icon: UserCog,
    color: "#16a34a",
    chip: "bg-success-soft text-success-text ring-success-border",
    fields: [
      { key: "action", label: "Action", kind: "select", options: crmActions },
      { key: "assignee", label: "Assign to", kind: "select", options: assignees },
    ],
    defaults: { title: "Assign owner", config: { action: "assign", assignee: "round-robin" } },
    summary: (c) => (c.action === "assign" ? pick(assignees, c.assignee) : pick(crmActions, c.action)),
  },
  communication: {
    label: "Communication",
    description: "Email, SMS or Slack",
    icon: Mail,
    color: "#0284c7",
    chip: "bg-sky-50 text-sky-700 ring-sky-200",
    fields: [
      { key: "channel", label: "Channel", kind: "select", options: channels },
      { key: "template", label: "Template", kind: "text", placeholder: "Welcome email" },
    ],
    defaults: { title: "Send email", config: { channel: "email", template: "Welcome · book a demo" } },
    summary: (c) => `${pick(channels, c.channel)}${c.template ? ` · ${c.template}` : ""}`,
  },
  task: {
    label: "Task",
    description: "Create a to-do",
    icon: ListChecks,
    color: "#7c3aed",
    chip: "bg-violet-50 text-violet-700 ring-violet-200",
    fields: [
      { key: "task", label: "Task", kind: "text", placeholder: "Call the lead" },
      { key: "assignee", label: "Assignee", kind: "select", options: assignees.slice(1) },
      { key: "due", label: "Due", kind: "select", options: dueOptions },
    ],
    defaults: { title: "Create task", config: { task: "Intro call", assignee: "lead-owner", due: "today" } },
    summary: (c) => `${c.task || "Task"} · ${pick(dueOptions, c.due).toLowerCase()}`,
  },
  delay: {
    label: "Delay",
    description: "Wait before continuing",
    icon: Timer,
    color: "#64748b",
    chip: "bg-sunken text-muted ring-border",
    fields: [
      { key: "amount", label: "Wait for", kind: "number", placeholder: "1" },
      { key: "unit", label: "Unit", kind: "select", options: units },
    ],
    defaults: { title: "Wait", config: { amount: "1", unit: "days" } },
    summary: (c) => {
      const n = Number(c.amount) || 0;
      const unit = pick(units, c.unit).toLowerCase();
      return `Wait ${n} ${n === 1 ? unit.replace(/s$/, "") : unit}`;
    },
  },
  webhook: {
    label: "Webhook",
    description: "Call an external URL",
    icon: Webhook,
    color: "#e11d48",
    chip: "bg-rose-50 text-rose-700 ring-rose-200",
    fields: [
      { key: "method", label: "Method", kind: "select", options: methods },
      { key: "url", label: "URL", kind: "text", placeholder: "https://example.com/hooks/lead" },
    ],
    defaults: { title: "Send webhook", config: { method: "POST", url: "" } },
    summary: (c) => `${c.method || "POST"} ${c.url ? c.url.replace(/^https?:\/\//, "") : "· no URL yet"}`,
  },
};

export const nodeOrder: NodeType[] = ["trigger", "ai", "condition", "crm", "communication", "task", "delay", "webhook"];

export const portsFor = (type: NodeType): Port[] => (type === "condition" ? ["yes", "no"] : ["out"]);

export function portPosition(node: FlowNode, port: Port | "in") {
  if (port === "in") return { x: node.x + NODE_W / 2, y: node.y };
  const ratio = port === "yes" ? 0.3 : port === "no" ? 0.7 : 0.5;
  return { x: node.x + NODE_W * ratio, y: node.y + NODE_H };
}
