import type { LucideIcon } from "lucide-react";
import { CalendarCheck, CircleCheck, Kanban, Sparkles, Target } from "lucide-react";

export type Range = "7d" | "30d" | "90d";

export type RangePoint = { label: string; current: number; previous: number };

export type RangeData = {
  revenue: number;
  revenueChange: number;
  leads: number;
  leadsChange: number;
  conversion: number;
  conversionChange: number;
  series: RangePoint[];
};

function wave(i: number, seed: number) {
  return Math.sin(i * 1.7 + seed) * 0.5 + Math.sin(i * 0.9 + seed * 2.3) * 0.5;
}

function buildSeries(labels: string[], base: number, growth: number, seed: number): RangePoint[] {
  return labels.map((label, i) => {
    const trend = base * (1 + (growth * i) / labels.length);
    return {
      label,
      current: Math.round(trend * (1 + wave(i, seed) * 0.08)),
      previous: Math.round(base * 0.86 * (1 + (growth * 0.6 * i) / labels.length) * (1 + wave(i, seed + 4) * 0.07)),
    };
  });
}

export const ranges: Record<Range, RangeData> = {
  "7d": {
    revenue: 48920,
    revenueChange: 8.4,
    leads: 186,
    leadsChange: 12.1,
    conversion: 4.8,
    conversionChange: 0.6,
    series: buildSeries(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], 6200, 0.35, 1),
  },
  "30d": {
    revenue: 214380,
    revenueChange: 18.2,
    leads: 812,
    leadsChange: 9.7,
    conversion: 5.2,
    conversionChange: 1.1,
    series: buildSeries(
      ["Aug 28", "Aug 31", "Sep 3", "Sep 6", "Sep 9", "Sep 12", "Sep 15", "Sep 18", "Sep 21", "Sep 24"],
      18400,
      0.45,
      2,
    ),
  },
  "90d": {
    revenue: 612450,
    revenueChange: 24.6,
    leads: 2390,
    leadsChange: 15.3,
    conversion: 4.9,
    conversionChange: 0.8,
    series: buildSeries(
      ["W27", "W28", "W29", "W30", "W31", "W32", "W33", "W34", "W35", "W36", "W37", "W38", "W39"],
      41000,
      0.5,
      3,
    ),
  },
};

export type ActivityKind = "stage" | "lead" | "ai" | "won" | "meeting";

export type ActivityTemplate = {
  kind: ActivityKind;
  subject: string;
  action: string;
  meta: string;
};

export type Activity = ActivityTemplate & { id: number; createdAt: number };

export const activityIcons: Record<ActivityKind, { icon: LucideIcon; className: string }> = {
  stage: { icon: Kanban, className: "bg-primary-soft text-primary-active" },
  lead: { icon: Target, className: "bg-sky-50 text-sky-700" },
  ai: { icon: Sparkles, className: "bg-accent-soft text-accent-hover" },
  won: { icon: CircleCheck, className: "bg-success-soft text-success-text" },
  meeting: { icon: CalendarCheck, className: "bg-warning-soft text-warning-text" },
};

export const activityPool: ActivityTemplate[] = [
  { kind: "stage", subject: "Helio Energy", action: "moved to Negotiation", meta: "$96,000 · Leo Grant" },
  { kind: "ai", subject: "AI assistant", action: "drafted 4 follow-ups", meta: "Waiting for your review" },
  { kind: "lead", subject: "Kestrel Studio", action: "signed up from pricing page", meta: "Lead score 86 · Inbound" },
  { kind: "won", subject: "Stackfield", action: "closed won", meta: "$31,000 · Olayemi Akinola" },
  { kind: "meeting", subject: "Meridian Foods", action: "booked a demo", meta: "Tue 10:30 · Priya Shah" },
  { kind: "stage", subject: "Aurora Retail", action: "moved to Proposal", meta: "$22,000 · Priya Shah" },
  { kind: "ai", subject: "AI assistant", action: "flagged 2 deals at risk", meta: "No reply in 9 days" },
  { kind: "lead", subject: "Northwind Health", action: "requested pricing", meta: "Lead score 91 · Referral" },
  { kind: "won", subject: "Brightline Logistics", action: "closed won", meta: "$48,000 · Olayemi Akinola" },
];

export function initialActivity(now: number): Activity[] {
  const offsets = [2, 7, 13, 22];
  return activityPool.slice(0, 4).map((template, i) => ({
    ...template,
    id: i,
    createdAt: now - offsets[i] * 60_000,
  }));
}

export function formatAgo(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
}

export const pipelineStages = [
  { label: "Qualified", value: 482000, deals: 42 },
  { label: "Proposal", value: 356000, deals: 27 },
  { label: "Negotiation", value: 214000, deals: 14 },
  { label: "Closing", value: 132000, deals: 8 },
];

export type Insight = {
  title: string;
  body: string;
  impact: string;
  action: string;
};

export const insights: Insight[] = [
  {
    title: "3 high-intent leads went quiet",
    body: "Brightline, Northwind and Helio opened your proposal twice this week but haven't replied. Following up today lifts reply rates by 27%.",
    impact: "$156K pipeline at risk",
    action: "Draft follow-ups",
  },
  {
    title: "Tuesday demos convert 2× better",
    body: "Deals with a Tuesday demo close at 38% versus a 19% average. Moving open demo slots could add four wins this quarter.",
    impact: "+11 pts win rate",
    action: "Update booking page",
  },
  {
    title: "Expansion signal at Stackfield",
    body: "Usage grew 64% in 30 days and seats are 92% full. Accounts with this profile usually upgrade within two weeks.",
    impact: "+$18K ARR opportunity",
    action: "Create expansion deal",
  },
];

export type PreviewTask = {
  id: string;
  title: string;
  due: string;
  owner: string;
  ai?: boolean;
  done: boolean;
};

export const initialTasks: PreviewTask[] = [
  { id: "t1", title: "Follow up with Brightline Logistics", due: "Today", owner: "Olayemi Akinola", done: false },
  { id: "t2", title: "Review 12 AI-scored leads", due: "Today", owner: "Olayemi Akinola", ai: true, done: false },
  { id: "t3", title: "Send proposal to Helio Energy", due: "Tomorrow", owner: "Leo Grant", done: false },
  { id: "t4", title: "Prepare Q4 pipeline review", due: "Fri", owner: "Priya Shah", done: true },
];

export const OTHER_OPEN_TASKS = 14;
