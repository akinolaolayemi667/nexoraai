import {
  AlarmClock,
  CheckCircle2,
  DollarSign,
  Flame,
  Gift,
  Hourglass,
  TrendingUp,
  UserCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { Deal, DealStage } from "@/lib/crm/types";

/* Metrics ----------------------------------------------------------------- */

export type Metric = {
  id: string;
  label: string;
  value: number;
  format: (value: number) => string;
  change: number;
  icon: LucideIcon;
  href: string;
  trend: number[];
};

export const metrics: Metric[] = [
  {
    id: "revenue",
    label: "Revenue",
    value: 84250,
    format: formatCurrency,
    change: 12.8,
    icon: DollarSign,
    href: routes.app.analytics,
    trend: [58, 61, 60, 66, 64, 71, 76, 74, 81, 84],
  },
  {
    id: "new-leads",
    label: "New Leads",
    value: 248,
    format: formatNumber,
    change: 18.4,
    icon: UserPlus,
    href: routes.app.leads,
    trend: [162, 170, 181, 176, 195, 204, 199, 221, 236, 248],
  },
  {
    id: "qualified-leads",
    label: "Qualified Leads",
    value: 126,
    format: formatNumber,
    change: 9.2,
    icon: UserCheck,
    href: routes.app.leads,
    trend: [98, 104, 101, 108, 112, 109, 115, 118, 121, 126],
  },
  {
    id: "tasks-completed",
    label: "Tasks Completed",
    value: 184,
    format: formatNumber,
    change: 22.1,
    icon: CheckCircle2,
    href: routes.app.automations,
    trend: [118, 126, 131, 128, 142, 151, 149, 166, 172, 184],
  },
];

/* Lead performance -------------------------------------------------------- */

export type Period = "7d" | "30d" | "90d";

export type LeadPoint = { label: string; leads: number; qualified: number; converted: number };

type PeriodConfig = {
  label: string;
  comparison: string;
  buckets: number;
  stepDays: number;
  totals: { leads: number; qualified: number; converted: number };
  change: number;
  conversionChange: number;
};

export const periods: Record<Period, PeriodConfig> = {
  "7d": {
    label: "7D",
    comparison: "vs previous 7 days",
    buckets: 7,
    stepDays: 1,
    totals: { leads: 64, qualified: 33, converted: 11 },
    change: 6.3,
    conversionChange: 0.8,
  },
  "30d": {
    label: "30D",
    comparison: "vs previous 30 days",
    buckets: 30,
    stepDays: 1,
    totals: { leads: 248, qualified: 126, converted: 41 },
    change: 18.4,
    conversionChange: 2.1,
  },
  "90d": {
    label: "90D",
    comparison: "vs previous 90 days",
    buckets: 13,
    stepDays: 7,
    totals: { leads: 684, qualified: 332, converted: 109 },
    change: 31.5,
    conversionChange: 3.4,
  },
};

const noise = (i: number, seed: number) => {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Splits `total` across `weights` so the integer parts always add back up to `total`. */
function distribute(total: number, weights: number[]) {
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / sum) * total);
  const result = raw.map(Math.floor);
  let remainder = total - result.reduce((a, b) => a + b, 0);
  const order = raw.map((value, i) => ({ fraction: value - result[i], i })).sort((a, b) => b.fraction - a.fraction);
  for (const { i } of order) {
    if (remainder <= 0) break;
    result[i] += 1;
    remainder -= 1;
  }
  return result;
}

const dayLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

export function leadSeries(period: Period, today = new Date()): LeadPoint[] {
  const { buckets, stepDays, totals } = periods[period];
  const dates = Array.from({ length: buckets }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (buckets - 1 - i) * stepDays);
    return date;
  });

  const leadWeights = dates.map((date, i) => {
    const weekend = stepDays === 1 && (date.getDay() === 0 || date.getDay() === 6) ? 0.55 : 1;
    const trend = 0.8 + 0.4 * (i / Math.max(1, buckets - 1));
    return weekend * trend * (0.75 + 0.5 * noise(i, buckets));
  });
  const leads = distribute(totals.leads, leadWeights);
  const qualified = distribute(totals.qualified, leads.map((v, i) => v * (0.8 + 0.4 * noise(i, 2))));
  const converted = distribute(totals.converted, qualified.map((v, i) => v * (0.7 + 0.6 * noise(i, 3))));

  return dates.map((date, i) => ({
    label: dayLabel.format(date),
    leads: leads[i],
    qualified: Math.min(qualified[i], leads[i]),
    converted: Math.min(converted[i], qualified[i]),
  }));
}

/* Pipeline ---------------------------------------------------------------- */

export type PipelineStage = {
  id: string;
  name: string;
  deals: number;
  value: number;
  /** Average win probability, 0–100. */
  probability: number;
  color: string;
};

const summaryStages: { id: string; name: string; from: DealStage[]; color: string }[] = [
  { id: "new", name: "New", from: ["new"], color: "var(--color-chart-6)" },
  { id: "qualified", name: "Qualified", from: ["qualified", "discovery"], color: "var(--color-chart-3)" },
  { id: "proposal", name: "Proposal", from: ["proposal"], color: "var(--color-chart-1)" },
  { id: "negotiation", name: "Negotiation", from: ["negotiation"], color: "var(--color-chart-2)" },
  { id: "won", name: "Won", from: ["won"], color: "var(--color-success)" },
];

const WON_WINDOW = 30 * 24 * 3600_000;

export function summarizePipeline(deals: Deal[], now = Date.now()) {
  const recent = (d: Deal) => (d.closedAt ?? d.lastActivityAt) >= now - WON_WINDOW;
  const stages: PipelineStage[] = summaryStages.map((stage) => {
    const inStage = deals.filter((d) => stage.from.includes(d.stage) && (stage.id !== "won" || recent(d)));
    const value = inStage.reduce((sum, d) => sum + d.value, 0);
    return {
      id: stage.id,
      name: stage.name,
      color: stage.color,
      deals: inStage.length,
      value,
      probability: inStage.length ? Math.round(inStage.reduce((sum, d) => sum + d.probability, 0) / inStage.length) : 0,
    };
  });
  const open = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const won = deals.filter((d) => d.stage === "won" && recent(d)).length;
  const lost = deals.filter((d) => d.stage === "lost" && recent(d)).length;
  return {
    stages,
    openValue: open.reduce((sum, d) => sum + d.value, 0),
    openDeals: open.length,
    weighted: open.reduce((sum, d) => sum + (d.value * d.probability) / 100, 0),
    winRate: won + lost > 0 ? (won / (won + lost)) * 100 : 0,
  };
}

/* Lead sources ------------------------------------------------------------ */

export type LeadSource = { id: string; name: string; leads: number; converted: number };

export const leadSources: LeadSource[] = [
  { id: "organic", name: "Organic search", leads: 94, converted: 20 },
  { id: "referral", name: "Referrals", leads: 55, converted: 10 },
  { id: "paid", name: "Paid ads", leads: 45, converted: 5 },
  { id: "social", name: "Social", leads: 30, converted: 3 },
  { id: "events", name: "Events", leads: 24, converted: 3 },
];

/* AI insights ------------------------------------------------------------- */

export type InsightKind = "action" | "risk" | "opportunity";
export type InsightCategory = "Leads" | "Pipeline" | "Marketing";

export type InsightAction =
  | { type: "navigate"; label: string; href: string }
  | { type: "scroll"; label: string; target: string }
  | { type: "run"; label: string; runningLabel: string; doneLabel: string };

export type Insight = {
  id: string;
  kind: InsightKind;
  category: InsightCategory;
  priority: "high" | "medium" | "low";
  icon: LucideIcon;
  title: string;
  detail: string;
  impact: string;
  action: InsightAction;
};

export const insights: Insight[] = [
  {
    id: "follow-up",
    kind: "action",
    category: "Leads",
    priority: "high",
    icon: Flame,
    title: "12 high-intent leads need follow-up.",
    detail:
      "Each scored above 80 after visiting pricing at least twice, but nobody on the team has replied in the last 24 hours.",
    impact: "$38,400 potential pipeline",
    action: { type: "navigate", label: "Review leads", href: `${routes.app.leads}?score=hot&sort=score` },
  },
  {
    id: "inactive",
    kind: "risk",
    category: "Pipeline",
    priority: "high",
    icon: Hourglass,
    title: "3 opportunities have been inactive for more than 7 days.",
    detail:
      "Aurora Retail, Pinecrest Finance and Northwind Health have had no calls, emails or stage changes in over a week.",
    impact: "$49,500 at risk",
    action: { type: "run", label: "Draft follow-ups", runningLabel: "Drafting…", doneLabel: "3 drafts ready" },
  },
  {
    id: "organic",
    kind: "opportunity",
    category: "Marketing",
    priority: "medium",
    icon: TrendingUp,
    title: "Your highest-converting source this month is organic traffic.",
    detail: "Organic search leads convert at 21.3% — nearly double paid ads at 11.1% — and make up 38% of new leads.",
    impact: "21.3% conversion rate",
    action: { type: "scroll", label: "See sources", target: "lead-sources" },
  },
  {
    id: "response-time",
    kind: "risk",
    category: "Leads",
    priority: "medium",
    icon: AlarmClock,
    title: "New leads wait 3.2 hours for a first reply.",
    detail:
      "Leads contacted within an hour convert 2.4× more often. Average response time is up 40 minutes from last month.",
    impact: "2.4× conversion lift",
    action: { type: "navigate", label: "Set up auto-reply", href: routes.app.automations },
  },
  {
    id: "close-this-week",
    kind: "opportunity",
    category: "Pipeline",
    priority: "medium",
    icon: CheckCircle2,
    title: "Brightline Logistics is likely to close this week.",
    detail: "Engagement tripled and their champion opened the proposal six times. Predicted win probability is 82%.",
    impact: "$48,000 deal",
    action: { type: "run", label: "Prepare close plan", runningLabel: "Preparing…", doneLabel: "Close plan ready" },
  },
  {
    id: "referrals",
    kind: "opportunity",
    category: "Marketing",
    priority: "low",
    icon: Gift,
    title: "Referral leads close 34% faster.",
    detail: "Referred deals take 16 days on average to close, compared with 24 days across all sources.",
    impact: "8 days shorter cycle",
    action: { type: "run", label: "Draft referral campaign", runningLabel: "Drafting…", doneLabel: "Campaign drafted" },
  },
];
