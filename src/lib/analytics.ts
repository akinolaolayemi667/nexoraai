import { leadSeries, leadSources, type Period } from "@/components/dashboard/dashboard-data";
import { distribute, noise } from "@/lib/distribute";

export type RangeId = "today" | "7d" | "30d" | "90d" | "custom";

export type Totals = {
  revenue: number;
  leads: number;
  qualified: number;
  proposals: number;
  customers: number;
  spend: number;
  runs: number;
  failed: number;
};

export type AnalyticsPoint = {
  label: string;
  revenue: number;
  leads: number;
  qualified: number;
  unqualified: number;
  customers: number;
  spend: number;
  successful: number;
  failed: number;
};

type Preset = { totals: Totals; change: Record<keyof Totals, number>; comparison: string };

const presets: Record<Exclude<RangeId, "custom">, Preset> = {
  today: {
    comparison: "vs yesterday",
    totals: { revenue: 3120, leads: 9, qualified: 5, proposals: 3, customers: 2, spend: 540, runs: 1842, failed: 44 },
    change: { revenue: 6.2, leads: 12.5, qualified: 25, proposals: 50, customers: 0, spend: -3.1, runs: 4.8, failed: -8.3 },
  },
  "7d": {
    comparison: "vs previous 7 days",
    totals: { revenue: 21640, leads: 64, qualified: 33, proposals: 18, customers: 11, spend: 4180, runs: 12460, failed: 291 },
    change: { revenue: 9.4, leads: 6.3, qualified: 6.5, proposals: 12.5, customers: 10, spend: 2.2, runs: 7.1, failed: -4.3 },
  },
  "30d": {
    comparison: "vs previous 30 days",
    totals: { revenue: 84250, leads: 248, qualified: 126, proposals: 68, customers: 41, spend: 16810, runs: 51380, failed: 1196 },
    change: { revenue: 12.8, leads: 18.4, qualified: 9.2, proposals: 13.3, customers: 36.7, spend: 5.6, runs: 11.4, failed: -6.1 },
  },
  "90d": {
    comparison: "vs previous 90 days",
    totals: { revenue: 236900, leads: 684, qualified: 332, proposals: 187, customers: 109, spend: 47960, runs: 146200, failed: 3640 },
    change: { revenue: 21.7, leads: 31.5, qualified: 24.8, proposals: 19.9, customers: 34.6, spend: 12.4, runs: 18.9, failed: -2.7 },
  },
};

const DAY = 86_400_000;
const keys = Object.keys(presets["30d"].totals) as (keyof Totals)[];

export function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toInputDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromInputDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export const daysBetween = (from: Date, to: Date) => Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY) + 1;

/** Custom ranges scale the 30-day baseline by length, with older windows slightly smaller as the business grows. */
function customTotals(from: Date, to: Date, today: Date): Totals {
  const days = daysBetween(from, to);
  const midAgo = (startOfDay(today).getTime() - (startOfDay(from).getTime() + startOfDay(to).getTime()) / 2) / DAY;
  const growth = Math.min(1.08, Math.max(0.4, 1 + 0.004 * (15 - midAgo)));
  const seed = Math.floor(startOfDay(from).getTime() / DAY);
  const base = presets["30d"].totals;
  const result = {} as Totals;
  keys.forEach((k, i) => {
    const trend = k === "failed" ? 2 - growth : growth;
    result[k] = Math.round((base[k] * days * trend * (0.97 + 0.06 * noise(i, seed))) / 30);
  });
  result.qualified = Math.min(result.qualified, result.leads);
  result.proposals = Math.min(result.proposals, result.qualified);
  result.customers = Math.min(result.customers, result.proposals);
  result.failed = Math.min(result.failed, result.runs);
  return result;
}

export type RangeData = {
  id: RangeId;
  label: string;
  comparison: string;
  from: Date;
  to: Date;
  totals: Totals;
  previous: Totals;
  points: AnalyticsPoint[];
  granularity: "hour" | "day" | "week" | "month";
};

const fmtDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const fmtHour = new Intl.DateTimeFormat("en-US", { hour: "numeric" });
const fmtMonth = new Intl.DateTimeFormat("en-US", { month: "short" });

export function rangeLabel(from: Date, to: Date) {
  return daysBetween(from, to) === 1 ? fmtDay.format(from) : `${fmtDay.format(from)} – ${fmtDay.format(to)}`;
}

function buckets(from: Date, to: Date, granularity: RangeData["granularity"], now: Date) {
  const list: { label: string; weekend: boolean; hour?: number }[] = [];
  if (granularity === "hour") {
    for (let h = 0; h <= now.getHours(); h++) {
      const d = new Date(from);
      d.setHours(h);
      list.push({ label: fmtHour.format(d), weekend: false, hour: h });
    }
    return list;
  }
  const cursor = startOfDay(from);
  const end = startOfDay(to).getTime();
  while (cursor.getTime() <= end) {
    const d = new Date(cursor);
    if (granularity === "day") {
      list.push({ label: fmtDay.format(d), weekend: d.getDay() === 0 || d.getDay() === 6 });
      cursor.setDate(cursor.getDate() + 1);
    } else if (granularity === "week") {
      list.push({ label: fmtDay.format(d), weekend: false });
      cursor.setDate(cursor.getDate() + 7);
    } else {
      list.push({ label: fmtMonth.format(d), weekend: false });
      cursor.setMonth(cursor.getMonth() + 1, 1);
    }
  }
  return list;
}

function buildPoints(
  totals: Totals,
  slots: { label: string; weekend: boolean; hour?: number }[],
  seed: number,
  base?: { leads: number; qualified: number; converted: number }[],
): AnalyticsPoint[] {
  const n = slots.length;
  const weights = slots.map((slot, i) => {
    const shape = slot.hour !== undefined ? (slot.hour >= 8 && slot.hour <= 18 ? 1 : slot.hour >= 6 && slot.hour <= 21 ? 0.45 : 0.12) : slot.weekend ? 0.55 : 1;
    return shape * (0.8 + 0.4 * (i / Math.max(1, n - 1))) * (0.75 + 0.5 * noise(i, seed));
  });
  const leads = base ? base.map((b) => b.leads) : distribute(totals.leads, weights);
  const qualified = base ? base.map((b) => b.qualified) : distribute(totals.qualified, leads.map((v, i) => v * (0.8 + 0.4 * noise(i, seed + 2)) + 0.01));
  const customers = base ? base.map((b) => b.converted) : distribute(totals.customers, qualified.map((v, i) => v * (0.7 + 0.6 * noise(i, seed + 3)) + 0.01));
  const revenueWeights = slots.map((slot, i) => {
    const shape = slot.hour !== undefined ? weights[i] : slot.weekend ? 0.82 : 1;
    const smooth = 0.5 * noise(i, seed + 4) + 0.3 * noise(i - 1, seed + 4) + 0.2 * noise(i + 1, seed + 4);
    return shape * (0.85 + 0.3 * (i / Math.max(1, n - 1))) * (0.85 + 0.3 * smooth);
  });
  const revenue = distribute(totals.revenue, revenueWeights);
  const spend = distribute(totals.spend, weights.map((w, i) => w * (0.9 + 0.2 * noise(i, seed + 5))));
  const runs = distribute(totals.runs, weights.map((w) => w + 0.3));
  const failed = distribute(totals.failed, runs.map((r, i) => r * (0.5 + noise(i, seed + 6))));
  return slots.map((slot, i) => ({
    label: slot.label,
    revenue: revenue[i],
    leads: leads[i],
    qualified: Math.min(qualified[i], leads[i]),
    unqualified: leads[i] - Math.min(qualified[i], leads[i]),
    customers: customers[i],
    spend: spend[i],
    successful: runs[i] - failed[i],
    failed: failed[i],
  }));
}

export function analyticsFor(range: RangeId, customFrom: Date | null, customTo: Date | null, now = new Date()): RangeData {
  const today = startOfDay(now);
  if (range !== "custom" || !customFrom || !customTo) {
    const id = range === "custom" ? "30d" : range;
    const preset = presets[id];
    const days = id === "today" ? 1 : id === "7d" ? 7 : id === "30d" ? 30 : 91;
    const from = new Date(today.getTime() - (days - 1) * DAY);
    const previous = {} as Totals;
    keys.forEach((k) => (previous[k] = Math.round(preset.totals[k] / (1 + preset.change[k] / 100))));
    const granularity = id === "today" ? "hour" : id === "90d" ? "week" : "day";
    const base = id === "today" ? undefined : leadSeries(id as Period, now);
    const slots = base ? base.map((b) => ({ label: b.label, weekend: false })) : buckets(from, today, granularity, now);
    return {
      id,
      label: id === "today" ? "Today" : `Last ${days === 91 ? 90 : days} days`,
      comparison: preset.comparison,
      from,
      to: today,
      totals: preset.totals,
      previous,
      points: buildPoints(preset.totals, slots, days, base),
      granularity,
    };
  }
  const from = startOfDay(customFrom);
  const to = startOfDay(customTo);
  const days = daysBetween(from, to);
  const granularity = days <= 31 ? "day" : days <= 180 ? "week" : "month";
  const totals = customTotals(from, to, today);
  const prevTo = new Date(from.getTime() - DAY);
  const prevFrom = new Date(prevTo.getTime() - (days - 1) * DAY);
  return {
    id: "custom",
    label: rangeLabel(from, to),
    comparison: `vs previous ${days} ${days === 1 ? "day" : "days"}`,
    from,
    to,
    totals,
    previous: customTotals(prevFrom, prevTo, today),
    points: buildPoints(totals, buckets(from, to, granularity, now), Math.floor(from.getTime() / DAY) % 997),
    granularity,
  };
}

export function sourceBreakdown(totals: Totals) {
  const leads = distribute(totals.leads, leadSources.map((s) => s.leads));
  const customers = distribute(totals.customers, leadSources.map((s) => s.converted));
  return leadSources.map((s, i) => ({ id: s.id, name: s.name, leads: leads[i], customers: Math.min(customers[i], leads[i]) }));
}

export const pctChange = (current: number, previous: number) => (previous === 0 ? (current === 0 ? 0 : 100) : ((current - previous) / previous) * 100);
