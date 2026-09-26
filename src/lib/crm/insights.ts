import { ownerFirstName, sourceLabel, statusMeta } from "./constants";
import { hashString, mulberry32 } from "./seed";
import type { Deal, Lead, Task } from "./types";
import { formatCurrency, formatRelative, formatShortDate, formatTime } from "@/lib/format";

const HOUR = 3600_000;
const DAY = 24 * HOUR;

export function scoreBreakdown(lead: Lead, now = Date.now()) {
  const rng = mulberry32(hashString(`${lead.id}:score`));
  const jitter = (spread: number) => Math.round((rng() - 0.5) * spread);
  const clamp = (n: number) => Math.max(5, Math.min(100, n));
  const age = now - lead.lastActivityAt;
  const recency = age < DAY ? 96 : age < 3 * DAY ? 82 : age < 7 * DAY ? 64 : age < 14 * DAY ? 42 : 22;
  return [
    { id: "fit", label: "Company fit", value: clamp(lead.score + jitter(24)), hint: "Industry, size and role match your best customers" },
    { id: "engagement", label: "Engagement", value: clamp(lead.score + jitter(30)), hint: "Email opens, replies and meetings" },
    { id: "intent", label: "Buying intent", value: clamp(lead.score + jitter(20)), hint: "Pricing visits, demo requests and proposal views" },
    { id: "recency", label: "Recency", value: recency, hint: `Last active ${formatRelative(lead.lastActivityAt, now).toLowerCase()}` },
  ];
}

export type NextStep = { label: string; task: string; dueIn: number };

export function nextStep(lead: Lead, openDeals: Deal[]): NextStep {
  const first = lead.name.split(" ")[0];
  if (lead.status === "new") return { label: `Reply to ${first} within the hour`, task: `Send first reply to ${first}`, dueIn: HOUR };
  if (lead.status === "contacted") return { label: "Book a discovery call", task: `Book discovery call with ${first}`, dueIn: DAY };
  if (lead.status === "nurturing") return { label: "Share a relevant case study", task: `Send case study to ${first}`, dueIn: 3 * DAY };
  if (lead.status === "won") return { label: "Schedule a 30-day check-in", task: `30-day check-in with ${first}`, dueIn: 7 * DAY };
  if (lead.status === "lost") return { label: "Set a reminder to reconnect next quarter", task: `Reconnect with ${first}`, dueIn: 90 * DAY };
  if (openDeals.length === 0) return { label: "Create a deal to track this opportunity", task: `Scope a deal with ${first}`, dueIn: DAY };
  return { label: "Send the proposal follow-up", task: `Follow up on proposal with ${first}`, dueIn: DAY };
}

export function aiSummary(lead: Lead, openDeals: Deal[], openTasks: Task[], now = Date.now()) {
  const first = lead.name.split(" ")[0];
  const tier = lead.score >= 80 ? "highly engaged" : lead.score >= 60 ? "warm" : lead.score >= 40 ? "lukewarm" : "cold";
  const idleDays = Math.floor((now - lead.lastActivityAt) / DAY);
  const pipeline = openDeals.reduce((sum, d) => sum + d.value, 0);
  const parts = [
    `${first} is a ${tier} ${statusMeta[lead.status].label.toLowerCase()} lead from ${sourceLabel[lead.source].toLowerCase()}, owned by ${ownerFirstName(lead.ownerId)}.`,
    `Most recent signal: ${lead.lastActivity.toLowerCase()} ${formatRelative(lead.lastActivityAt, now).toLowerCase()}.`,
  ];
  if (openDeals.length > 0) {
    parts.push(`${openDeals.length === 1 ? "One open deal" : `${openDeals.length} open deals`} worth ${formatCurrency(pipeline)} ${openDeals.length === 1 ? "is" : "are"} in the pipeline.`);
  }
  if (idleDays >= 7) parts.push(`No activity for ${idleDays} days — this relationship is at risk of going cold.`);
  else if (openTasks.some((t) => t.dueAt < now)) parts.push("There's an overdue task waiting on your team.");
  return parts.join(" ");
}

function startOfDay(timestamp: number) {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function dueLabel(dueAt: number, now = Date.now()) {
  const dayDiff = Math.round((startOfDay(dueAt) - startOfDay(now)) / DAY);
  const overdue = dueAt < now;
  if (dayDiff === 0) return { text: `${overdue ? "Overdue · " : "Today, "}${formatTime(dueAt)}`, tone: overdue ? "danger" : "warning" } as const;
  if (dayDiff === 1) return { text: `Tomorrow, ${formatTime(dueAt)}`, tone: "neutral" } as const;
  if (dayDiff < 0) return { text: `Overdue · ${formatShortDate(dueAt)}`, tone: "danger" } as const;
  return { text: formatShortDate(dueAt), tone: "neutral" } as const;
}

export const dueOptions = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "3d", label: "In 3 days" },
  { value: "week", label: "Next week" },
];

export function dueFromOption(option: string, now = Date.now()) {
  const d = new Date(now);
  if (option === "today") {
    d.setHours(17, 0, 0, 0);
    return d.getTime() > now ? d.getTime() : now + HOUR;
  }
  const days = option === "tomorrow" ? 1 : option === "3d" ? 3 : 7;
  d.setDate(d.getDate() + days);
  d.setHours(10, 0, 0, 0);
  return d.getTime();
}

export function dayGroupLabel(timestamp: number, now = Date.now()) {
  const diff = Math.round((startOfDay(now) - startOfDay(timestamp)) / DAY);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Intl.DateTimeFormat("en-US", {
    weekday: diff < 7 ? "long" : undefined,
    month: "short",
    day: "numeric",
    year: new Date(timestamp).getFullYear() === new Date(now).getFullYear() ? undefined : "numeric",
  }).format(timestamp);
}
