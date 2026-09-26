import { useState } from "react";
import { formatCompact, formatCurrency } from "@/lib/format";
import { chartColor } from "@/lib/tokens";
import {
  AreaChart,
  BarChart,
  Card,
  ChartContainer,
  ChartLegend,
  DonutChart,
  LineChart,
  MetricCard,
  Sparkline,
  Tabs,
  donutColor,
} from "@/components/ui";
import { DocBlock, DocSection } from "./doc";

const revenue = [
  { month: "Jan", newBusiness: 42000, expansion: 12000 },
  { month: "Feb", newBusiness: 46500, expansion: 13800 },
  { month: "Mar", newBusiness: 44200, expansion: 16100 },
  { month: "Apr", newBusiness: 51800, expansion: 15400 },
  { month: "May", newBusiness: 56300, expansion: 18900 },
  { month: "Jun", newBusiness: 54100, expansion: 21200 },
  { month: "Jul", newBusiness: 61900, expansion: 22800 },
  { month: "Aug", newBusiness: 66400, expansion: 24100 },
  { month: "Sep", newBusiness: 63800, expansion: 27600 },
  { month: "Oct", newBusiness: 71200, expansion: 29300 },
  { month: "Nov", newBusiness: 76800, expansion: 31800 },
  { month: "Dec", newBusiness: 82400, expansion: 34500 },
];

const responseTime = [
  { day: "Mon", ai: 1.2, human: 14 },
  { day: "Tue", ai: 1.1, human: 18 },
  { day: "Wed", ai: 0.9, human: 12 },
  { day: "Thu", ai: 1.4, human: 21 },
  { day: "Fri", ai: 1.0, human: 16 },
  { day: "Sat", ai: 0.8, human: 32 },
  { day: "Sun", ai: 0.9, human: 28 },
];

const leadsBySource = [
  { week: "W1", inbound: 84, outbound: 42, referral: 18 },
  { week: "W2", inbound: 92, outbound: 38, referral: 22 },
  { week: "W3", inbound: 78, outbound: 51, referral: 16 },
  { week: "W4", inbound: 104, outbound: 47, referral: 27 },
  { week: "W5", inbound: 97, outbound: 55, referral: 24 },
  { week: "W6", inbound: 118, outbound: 49, referral: 31 },
  { week: "W7", inbound: 126, outbound: 58, referral: 29 },
  { week: "W8", inbound: 131, outbound: 62, referral: 35 },
];

const pipelineStages = [
  { label: "Qualified", value: 482000 },
  { label: "Proposal", value: 356000 },
  { label: "Negotiation", value: 214000 },
  { label: "Closing", value: 132000 },
];

const revenueSeries = [
  { key: "newBusiness" as const, label: "New business" },
  { key: "expansion" as const, label: "Expansion" },
];

const sourceSeries = [
  { key: "inbound" as const, label: "Inbound" },
  { key: "outbound" as const, label: "Outbound" },
  { key: "referral" as const, label: "Referral" },
];

export function ChartsSection() {
  const [barLayout, setBarLayout] = useState<"grouped" | "stacked">("stacked");
  const pipelineTotal = pipelineStages.reduce((sum, s) => sum + s.value, 0);

  return (
    <DocSection
      id="charts"
      eyebrow="Data visualisation"
      title="Charts"
      description="Dependency-free SVG charts built on the chart palette. Hover or focus a chart and use the arrow keys to inspect values. All charts resize with their container."
    >
      <DocBlock id="chart-area" title="Area & line" description="Monotone curves never overshoot the data. Area fills fade to transparent so gridlines remain legible.">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <ChartContainer
            title="Revenue"
            metric={formatCurrency(1_421_300)}
            change={18.2}
            legend={revenueSeries.map((s, i) => ({ label: s.label, color: chartColor(i) }))}
            actions={
              <Tabs
                variant="segmented"
                defaultValue="12m"
                items={[
                  { value: "30d", label: "30D" },
                  { value: "90d", label: "90D" },
                  { value: "12m", label: "12M" },
                ]}
              />
            }
            className="lg:col-span-2"
          >
            <AreaChart
              data={revenue}
              index="month"
              series={revenueSeries}
              valueFormatter={(v) => `$${formatCompact(v)}`}
              aria-label="Monthly revenue by type"
            />
          </ChartContainer>
          <ChartContainer
            title="First response time"
            metric="1.0 min"
            change={-42}
            invertTrend
            changeLabel="vs last week"
            legend={[
              { label: "AI agent", color: chartColor(1) },
              { label: "Human", color: chartColor(5) },
            ]}
          >
            <LineChart
              data={responseTime}
              index="day"
              series={[
                { key: "ai", label: "AI agent", color: chartColor(1) },
                { key: "human", label: "Human", color: chartColor(5) },
              ]}
              valueFormatter={(v) => `${v}m`}
              showDots
              yAxisWidth={36}
              aria-label="Response time by day"
            />
          </ChartContainer>
        </div>
      </DocBlock>

      <DocBlock id="chart-bar" title="Bar" description="Grouped for comparison, stacked for composition. Stacked tooltips include a total.">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <ChartContainer
            title="Leads by source"
            metric="1,782"
            change={9.6}
            legend={sourceSeries.map((s, i) => ({ label: s.label, color: chartColor(i) }))}
            actions={
              <Tabs
                variant="segmented"
                value={barLayout}
                onValueChange={(v) => setBarLayout(v as typeof barLayout)}
                items={[
                  { value: "stacked", label: "Stacked" },
                  { value: "grouped", label: "Grouped" },
                ]}
              />
            }
            className="lg:col-span-2"
          >
            <BarChart data={leadsBySource} index="week" series={sourceSeries} layout={barLayout} aria-label="Weekly leads by source" />
          </ChartContainer>
          <ChartContainer title="Pipeline by stage" metric={formatCurrency(pipelineTotal)} height={300}>
            <div className="flex h-full flex-col gap-4">
              <div className="min-h-0 flex-1">
                <DonutChart data={pipelineStages} valueFormatter={(v) => `$${formatCompact(v)}`} centerLabel="Open pipeline" aria-label="Pipeline value by stage" />
              </div>
              <ChartLegend
                orientation="vertical"
                items={pipelineStages.map((s, i) => ({
                  label: s.label,
                  color: donutColor(s, i),
                  value: `${Math.round((s.value / pipelineTotal) * 100)}%`,
                }))}
              />
            </div>
          </ChartContainer>
        </div>
      </DocBlock>

      <DocBlock id="chart-states" title="Sparklines & states" description="Sparklines embed in metric cards. Chart containers provide loading, empty and error states.">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="MRR" value={formatCurrency(118_400)} change={6.1} chart={<Sparkline data={revenue.map((r) => r.newBusiness)} className="h-9 w-full" />} />
          <MetricCard label="AI resolutions" value="72%" change={4.8} chart={<Sparkline data={[48, 52, 55, 54, 60, 63, 66, 70, 72]} color="var(--color-accent)" className="h-9 w-full" />} />
          <MetricCard label="Support backlog" value="38" change={12} invertTrend chart={<Sparkline data={[20, 22, 21, 26, 30, 29, 34, 38]} color="var(--color-danger)" variant="line" className="h-9 w-full" />} />
          <Card padding="md" className="flex flex-col justify-between gap-3">
            <p className="text-sm font-medium text-muted">Sparkline variants</p>
            <div className="flex items-end gap-4">
              <Sparkline data={[3, 5, 4, 7, 6, 9, 8, 11]} />
              <Sparkline data={[3, 5, 4, 7, 6, 9, 8, 11]} variant="line" curve="linear" color="var(--color-chart-4)" />
            </div>
          </Card>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          <ChartContainer title="Win rate" metric="28.6%" change={-2.1} height={200} loading />
          <ChartContainer title="Churn" metric="1.9%" height={200} isEmpty />
          <ChartContainer title="Forecast" height={200} error="The forecasting service didn't respond." onRetry={() => {}} />
        </div>
      </DocBlock>
    </DocSection>
  );
}
