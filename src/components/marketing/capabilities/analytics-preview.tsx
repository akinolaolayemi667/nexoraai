import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { formatCompact } from "@/lib/format";
import { chartColor } from "@/lib/tokens";
import { AreaChart, BarChart, LineChart, Progress, Tabs } from "@/components/ui";
import { AppPanel, PanelHeader } from "./feature-layout";

type Metric = "revenue" | "leads" | "winRate";

const weeks = ["W32", "W33", "W34", "W35", "W36", "W37", "W38", "W39"];

const revenue = [62, 58, 71, 69, 78, 84, 81, 93].map((v, i) => ({
  week: weeks[i],
  current: v * 1000,
  target: (64 + i * 3) * 1000,
}));
const leads = [168, 181, 176, 194, 188, 205, 199, 212].map((v, i) => ({
  week: weeks[i],
  inbound: Math.round(v * 0.64),
  outbound: Math.round(v * 0.36),
}));
const winRate = [23.1, 24.4, 23.8, 25.9, 26.2, 27.5, 27.1, 28.6].map((v, i) => ({ week: weeks[i], rate: v }));

const metrics: Record<
  Metric,
  { label: string; value: string; change: string; breakdownTitle: string; breakdown: [string, number][] }
> = {
  revenue: {
    label: "Revenue",
    value: "$596K",
    change: "+18.2% vs last quarter",
    breakdownTitle: "By source",
    breakdown: [
      ["Inbound", 46],
      ["Outbound", 31],
      ["Partners", 23],
    ],
  },
  leads: {
    label: "New leads",
    value: "1,523",
    change: "+9.7% vs last quarter",
    breakdownTitle: "By channel",
    breakdown: [
      ["Website", 52],
      ["Referral", 27],
      ["Events", 21],
    ],
  },
  winRate: {
    label: "Win rate",
    value: "28.6%",
    change: "+2.4 pts vs last quarter",
    breakdownTitle: "By segment",
    breakdown: [
      ["SMB", 34],
      ["Mid-market", 27],
      ["Enterprise", 19],
    ],
  },
};

function Chart({ metric }: { metric: Metric }) {
  if (metric === "revenue") {
    return (
      <AreaChart
        data={revenue}
        index="week"
        series={[
          { key: "current", label: "Revenue", color: chartColor(0) },
          { key: "target", label: "Target", color: chartColor(5) },
        ]}
        valueFormatter={(v) => `$${formatCompact(v)}`}
        yAxisWidth={40}
        aria-label="Weekly revenue against target"
      />
    );
  }
  if (metric === "leads") {
    return (
      <BarChart
        data={leads}
        index="week"
        layout="stacked"
        series={[
          { key: "inbound", label: "Inbound", color: chartColor(0) },
          { key: "outbound", label: "Outbound", color: chartColor(1) },
        ]}
        maxBarWidth={22}
        yAxisWidth={32}
        aria-label="Weekly new leads by source"
      />
    );
  }
  return (
    <LineChart
      data={winRate}
      index="week"
      series={[{ key: "rate", label: "Win rate", color: chartColor(1) }]}
      valueFormatter={(v) => `${v.toFixed(1)}%`}
      yAxisWidth={40}
      showDots
      aria-label="Weekly win rate"
    />
  );
}

export function AnalyticsPreview() {
  const [metric, setMetric] = useState<Metric>("revenue");
  const data = metrics[metric];

  return (
    <AppPanel label="Interactive analytics preview" className="flex flex-col">
      <PanelHeader title="Revenue overview · Q3">
        <Tabs
          variant="segmented"
          value={metric}
          onValueChange={(v) => setMetric(v as Metric)}
          items={[
            { value: "revenue", label: "Revenue" },
            { value: "leads", label: "Leads" },
            { value: "winRate", label: "Win rate" },
          ]}
        />
      </PanelHeader>
      <div className="grid flex-1 grid-cols-1 sm:grid-cols-[1fr_11rem]">
        <div className="flex min-w-0 flex-col p-3.5">
          <p className="text-xs text-muted">{data.label}</p>
          <p className="text-metric text-2xl font-semibold text-ink">{data.value}</p>
          <p className="flex items-center gap-0.5 font-mono text-2xs text-success-text">
            <ArrowUpRight className="size-3" aria-hidden />
            {data.change}
          </p>
          <div className="mt-3 h-48 min-h-0 flex-1">
            <Chart metric={metric} />
          </div>
        </div>
        <div className="hidden flex-col gap-3 border-l border-border bg-canvas/50 p-3.5 sm:flex">
          <p className="text-2xs font-medium uppercase tracking-wider text-subtle">{data.breakdownTitle}</p>
          {data.breakdown.map(([label, value], i) => (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-ink">{label}</span>
                <span className="font-mono text-muted">{value}%</span>
              </div>
              <Progress value={value} max={metric === "winRate" ? 40 : 100} size="sm" tone={i === 0 ? "primary" : "accent"} />
            </div>
          ))}
          <div className="mt-auto rounded-md border border-accent-border bg-accent-soft/60 p-2.5">
            <p className="text-2xs font-semibold text-accent-hover">AI insight</p>
            <p className="mt-0.5 text-2xs text-ink">
              {metric === "revenue" && "Inbound revenue grew 24% after the pricing page redesign."}
              {metric === "leads" && "Referral leads convert 2.1× better than any other channel."}
              {metric === "winRate" && "Deals with a demo in week one close 38% more often."}
            </p>
          </div>
        </div>
      </div>
    </AppPanel>
  );
}
