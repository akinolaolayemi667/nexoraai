import { useMemo, type ComponentType } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  Download,
  Layers,
  Percent,
  UserPlus,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { downloadCsv } from "@/lib/csv";
import { useCrm } from "@/lib/crm/crm-context";
import { formatCompact, formatCurrency, formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import {
  analyticsFor,
  fromInputDate,
  pctChange,
  sourceBreakdown,
  startOfDay,
  toInputDate,
  type RangeData,
  type RangeId,
} from "@/lib/analytics";
import { summarizePipeline } from "@/components/dashboard/dashboard-data";
import { FunnelChart } from "@/components/analytics/funnel-chart";
import { RangePicker } from "@/components/analytics/range-picker";
import {
  AnimatedNumber,
  AreaChart,
  BarChart,
  Button,
  ChartContainer,
  DonutChart,
  Sparkline,
  buttonVariants,
} from "@/components/ui";

const RANGES: RangeId[] = ["today", "7d", "30d", "90d", "custom"];
const PIPELINE_CHANGE = 9.4;
const MINUTES_SAVED_PER_RUN = 3;
const sourceColors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

const money = (v: number) => `$${formatCompact(v)}`;
const rate = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);

/** Running ratio, seeded with a slice of the previous period so the first buckets don't swing wildly. */
function cumulativeRatio(num: number[], den: number[], seed: [number, number], scale = 1) {
  let [a, b] = seed;
  return num.map((n, i) => {
    a += n;
    b += den[i];
    return b > 0 ? (a / b) * scale : 0;
  });
}

function useRange() {
  const [params, setParams] = useSearchParams();
  const raw = params.get("range") as RangeId | null;
  const fromParam = params.get("from");
  const toParam = params.get("to");
  const today = startOfDay(new Date());
  let range: RangeId = raw && RANGES.includes(raw) ? raw : "30d";
  let from: Date | null = null;
  let to: Date | null = null;
  if (range === "custom") {
    const valid = (v: string | null) => v !== null && /^\d{4}-\d{2}-\d{2}$/.test(v);
    if (valid(fromParam) && valid(toParam)) {
      from = fromInputDate(fromParam!);
      to = fromInputDate(toParam!);
      if (to > today) to = today;
      if (from > to) from = to;
    } else range = "30d";
  }

  const setRange = (next: RangeId, f?: Date, t?: Date) => {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (next === "30d") p.delete("range");
        else p.set("range", next);
        if (next === "custom" && f && t) {
          p.set("from", toInputDate(f));
          p.set("to", toInputDate(t));
        } else {
          p.delete("from");
          p.delete("to");
        }
        return p;
      },
      { replace: true },
    );
  };

  return { range, from, to, setRange };
}

type Kpi = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  value: number;
  format: (v: number) => string;
  change: number;
  changeText: string;
  comparison?: string;
  lowerIsBetter?: boolean;
  trend: number[];
  href?: string;
};

function KpiTile({ kpi }: { kpi: Kpi }) {
  const up = kpi.change >= 0;
  const flat = Math.abs(kpi.change) < 0.05;
  const good = kpi.lowerIsBetter ? !up : up;
  const TrendIcon = up ? ArrowUpRight : ArrowDownRight;
  const className = cn(
    "glass-card glass-hover group flex h-full min-w-0 flex-col rounded-xl p-4 outline-none focus-visible:border-primary focus-visible:shadow-focus sm:p-5",
    kpi.href && "transition-[border-color,box-shadow] duration-150 hover:border-border-strong hover:shadow-md focus-visible:border-primary focus-visible:shadow-focus",
  );
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="line-clamp-2 text-sm font-medium text-muted">{kpi.label}</span>
        <span className="hidden size-7 shrink-0 items-center justify-center rounded-md bg-canvas text-subtle ring-1 ring-border sm:flex">
          <kpi.icon className="size-3.5" aria-hidden />
        </span>
      </div>
      <AnimatedNumber
        value={kpi.value}
        format={kpi.format}
        className="mt-auto block truncate pt-3 font-mono text-xl font-semibold tabular-nums tracking-tight text-ink sm:text-2xl"
      />
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-sm px-1 py-px font-mono font-medium tabular-nums",
              flat ? "bg-canvas text-muted" : good ? "bg-success-soft text-success-text" : "bg-danger-soft text-danger-text",
            )}
          >
            {!flat && <TrendIcon className="size-3" aria-hidden />}
            {kpi.changeText}
          </span>
          {kpi.comparison && <span className="text-subtle">{kpi.comparison}</span>}
        </p>
        <Sparkline
          data={kpi.trend}
          color={good || flat ? "var(--color-chart-1)" : "var(--color-danger)"}
          className="hidden h-6 w-14 shrink-0 sm:block"
        />
      </div>
    </>
  );
  return kpi.href ? (
    <Link to={kpi.href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

const signed = (v: number, digits = 1, unit = "%") => `${v > 0 ? "+" : ""}${v.toFixed(digits)}${unit}`;

function buildKpis(data: RangeData, pipeline: { openValue: number }): Kpi[] {
  const { totals, previous, points } = data;
  const conv = rate(totals.customers, totals.leads);
  const prevConv = rate(previous.customers, previous.leads);
  const cac = totals.customers > 0 ? totals.spend / totals.customers : 0;
  const prevCac = previous.customers > 0 ? previous.spend / previous.customers : 0;
  const cacChange = pctChange(cac, prevCac);
  const revenueChange = pctChange(totals.revenue, previous.revenue);
  const leadsChange = pctChange(totals.leads, previous.leads);
  const pipelineTrend = Array.from({ length: 12 }, (_, i) => pipeline.openValue * (0.9 + 0.1 * (i / 11)) * (0.98 + 0.04 * Math.sin(i * 1.7)));
  return [
    {
      id: "revenue",
      label: "Revenue",
      icon: CircleDollarSign,
      value: totals.revenue,
      format: (v) => formatCurrency(Math.round(v)),
      change: revenueChange,
      changeText: signed(revenueChange),
      trend: points.map((p) => p.revenue),
    },
    {
      id: "leads",
      label: "Leads",
      icon: UserPlus,
      value: totals.leads,
      format: (v) => formatNumber(Math.round(v)),
      change: leadsChange,
      changeText: signed(leadsChange),
      trend: points.map((p) => p.leads),
      href: routes.app.leads,
    },
    {
      id: "conversion",
      label: "Conversion Rate",
      icon: Percent,
      value: conv,
      format: (v) => `${v.toFixed(1)}%`,
      change: conv - prevConv,
      changeText: signed(conv - prevConv, 1, " pts"),
      trend: cumulativeRatio(points.map((p) => p.customers), points.map((p) => p.leads), [previous.customers / 3, previous.leads / 3], 100),
    },
    {
      id: "cac",
      label: "Customer Acquisition Cost",
      icon: Wallet,
      value: cac,
      format: (v) => formatCurrency(Math.round(v)),
      change: cacChange,
      changeText: signed(cacChange),
      lowerIsBetter: true,
      trend: cumulativeRatio(points.map((p) => p.spend), points.map((p) => p.customers), [previous.spend / 3, previous.customers / 3]),
    },
    {
      id: "pipeline",
      label: "Pipeline Value",
      icon: Layers,
      value: pipeline.openValue,
      format: (v) => formatCurrency(Math.round(v)),
      change: PIPELINE_CHANGE,
      changeText: signed(PIPELINE_CHANGE),
      comparison: "vs 30 days ago",
      trend: pipelineTrend,
      href: routes.app.pipeline,
    },
  ];
}

export default function AnalyticsPage() {
  const { state } = useCrm();
  const { range, from, to, setRange } = useRange();
  const fromKey = from?.getTime() ?? 0;
  const toKey = to?.getTime() ?? 0;
  const data = useMemo(
    () => analyticsFor(range, fromKey ? new Date(fromKey) : null, toKey ? new Date(toKey) : null),
    [range, fromKey, toKey],
  );
  const pipeline = useMemo(() => summarizePipeline(state.deals), [state.deals]);
  const kpis = useMemo(() => buildKpis(data, pipeline), [data, pipeline]);
  const sources = useMemo(() => sourceBreakdown(data.totals), [data.totals]);

  const { totals, previous, points, comparison } = data;
  const revenueChange = pctChange(totals.revenue, previous.revenue);
  const leadsChange = pctChange(totals.leads, previous.leads);
  const runsChange = pctChange(totals.runs, previous.runs);
  const successRate = rate(totals.runs - totals.failed, totals.runs);
  const bestPoint = points.reduce((best, p) => (p.revenue > best.revenue ? p : best), points[0]);
  const bestSource = sources.reduce((best, s) => (rate(s.customers, s.leads) > rate(best.customers, best.leads) ? s : best), sources[0]);
  const periodNoun = data.granularity === "hour" ? "hour" : data.granularity;

  const pipelineRows = pipeline.stages.map((s) => ({
    stage: s.name,
    value: s.value,
    weighted: s.id === "won" ? s.value : Math.round((s.value * s.probability) / 100),
  }));

  const funnel = [
    { label: "Leads", value: totals.leads, color: "var(--color-chart-3)" },
    { label: "Qualified", value: totals.qualified, color: "var(--color-chart-1)" },
    { label: "Proposal", value: totals.proposals, color: "var(--color-chart-2)" },
    { label: "Customers", value: totals.customers, color: "var(--color-success)" },
  ];

  const exportCsv = () => {
    const slug = data.id === "custom" ? `${toInputDate(data.from)}-to-${toInputDate(data.to)}` : data.id;
    downloadCsv(`nexora-analytics-${slug}.csv`, [
      ["Period", "Revenue", "Leads", "Qualified", "Customers", "Marketing spend", "Automation runs", "Failed runs"],
      ...points.map((p) => [p.label, p.revenue, p.leads, p.qualified, p.customers, p.spend, p.successful + p.failed, p.failed].map(String)),
      ["Total", totals.revenue, totals.leads, totals.qualified, totals.customers, totals.spend, totals.runs, totals.failed].map(String),
    ]);
  };

  return (
    <>
      <title>Business Analytics · NEXORA AI</title>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Business Analytics</h1>
          <p className="mt-1 text-base text-muted">Revenue, leads and automation results in one place.</p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<Download />} onClick={exportCsv} className="self-start sm:self-auto">
          Export CSV
        </Button>
      </header>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <RangePicker value={range} from={from} to={to} onChange={setRange} />
        <p className="text-xs text-subtle">
          <span className="font-medium text-muted">{data.label}</span> · changes {comparison}
        </p>
      </div>

      <section aria-label="Key metrics" className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi, i) => (
          <div key={kpi.id} className={cn("min-w-0", i === kpis.length - 1 && "col-span-2 lg:col-span-1")}>
            <KpiTile kpi={kpi} />
          </div>
        ))}
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <ChartContainer
          className="xl:col-span-8"
          title="Revenue trend"
          metric={formatCurrency(totals.revenue)}
          change={revenueChange}
          changeLabel={comparison}
          height={300}
          footer={
            bestPoint && (
              <span>
                Best {periodNoun}: <span className="font-medium text-ink">{bestPoint.label}</span> with{" "}
                <span className="font-mono text-ink">{formatCurrency(bestPoint.revenue)}</span>
                <span className="hidden sm:inline">
                  {" "}· Avg. per customer <span className="font-mono text-ink">{formatCurrency(Math.round(totals.revenue / Math.max(1, totals.customers)))}</span>
                </span>
              </span>
            )
          }
        >
          <AreaChart
            data={points}
            index="label"
            series={[{ key: "revenue", label: "Revenue", color: "var(--color-chart-1)" }]}
            valueFormatter={money}
            yAxisWidth={48}
            aria-label="Revenue trend"
          />
        </ChartContainer>

        <ChartContainer
          className="xl:col-span-4"
          title="Lead sources"
          description={`${formatNumber(totals.leads)} leads by channel`}
          height={300}
          isEmpty={totals.leads === 0}
          footer={
            totals.leads > 0 && (
              <span>
                <span className="font-medium text-ink">{bestSource.name}</span> converts best at{" "}
                <span className="font-mono text-success-text">{rate(bestSource.customers, bestSource.leads).toFixed(1)}%</span>
              </span>
            )
          }
        >
          <div className="flex h-full flex-col gap-3 sm:flex-row sm:items-center xl:flex-col xl:items-stretch">
            <DonutChart
              data={sources.map((s, i) => ({ label: s.name, value: s.leads, color: sourceColors[i] }))}
              valueFormatter={formatNumber}
              centerLabel="Leads"
              className="min-h-0 flex-1 sm:h-full xl:h-auto"
              aria-label="Leads by source"
            />
            <ul className="shrink-0 text-xs sm:w-52 xl:w-auto">
              {sources.map((s, i) => (
                <li key={s.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 py-1">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: sourceColors[i] }} aria-hidden />
                    <span className="truncate text-ink">{s.name}</span>
                  </span>
                  <span className="font-mono tabular-nums text-ink">{formatNumber(s.leads)}</span>
                  <span className="w-12 text-right font-mono tabular-nums text-subtle">{rate(s.leads, totals.leads).toFixed(0)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </ChartContainer>

        <ChartContainer
          className="xl:col-span-7"
          title="Lead acquisition"
          metric={formatNumber(totals.leads)}
          change={leadsChange}
          changeLabel={comparison}
          height={280}
          legend={[
            { label: "Qualified", color: "var(--color-chart-1)", value: formatNumber(totals.qualified) },
            { label: "Not yet qualified", color: "var(--color-primary-border)", value: formatNumber(totals.leads - totals.qualified) },
          ]}
        >
          <BarChart
            data={points}
            index="label"
            layout="stacked"
            series={[
              { key: "qualified", label: "Qualified", color: "var(--color-chart-1)" },
              { key: "unqualified", label: "Not yet qualified", color: "var(--color-primary-border)" },
            ]}
            valueFormatter={formatNumber}
            yAxisWidth={32}
            aria-label="Leads acquired per period"
          />
        </ChartContainer>

        <ChartContainer
          className="xl:col-span-5"
          title="Conversion funnel"
          metric={`${rate(totals.customers, totals.leads).toFixed(1)}%`}
          description={`${formatNumber(totals.customers)} of ${formatNumber(totals.leads)} leads became customers`}
          height={280}
          isEmpty={totals.leads === 0}
        >
          <FunnelChart stages={funnel} />
        </ChartContainer>

        <ChartContainer
          className="xl:col-span-6"
          title="Pipeline performance"
          metric={formatCurrency(pipeline.openValue)}
          description={`${formatNumber(pipeline.openDeals)} open deals · value and weighted forecast by stage`}
          height={260}
          legend={[
            { label: "Deal value", color: "var(--color-chart-2)" },
            { label: "Weighted forecast", color: "var(--color-chart-4)" },
          ]}
          footer={
            <div className="flex items-center justify-between gap-3">
              <span>
                Win rate <span className="font-mono text-ink">{pipeline.winRate.toFixed(0)}%</span>
                <span className="hidden sm:inline">
                  {" "}· Forecast <span className="font-mono text-ink">{formatCurrency(Math.round(pipeline.weighted))}</span>
                </span>
              </span>
              <Link to={routes.app.pipeline} className={buttonVariants({ variant: "ghost", size: "xs", className: "-mr-2 shrink-0" })}>
                Open pipeline
                <ArrowRight />
              </Link>
            </div>
          }
        >
          <BarChart
            data={pipelineRows}
            index="stage"
            series={[
              { key: "value", label: "Deal value", color: "var(--color-chart-2)" },
              { key: "weighted", label: "Weighted forecast", color: "var(--color-chart-4)" },
            ]}
            valueFormatter={money}
            maxBarWidth={28}
            yAxisWidth={48}
            aria-label="Pipeline value by stage"
          />
        </ChartContainer>

        <ChartContainer
          className="xl:col-span-6"
          title="Automation performance"
          metric={formatNumber(totals.runs)}
          change={runsChange}
          changeLabel={`runs ${comparison}`}
          description="Successful and failed workflow runs"
          height={260}
          legend={[
            { label: "Successful", color: "var(--color-chart-4)", value: formatNumber(totals.runs - totals.failed) },
            { label: "Failed", color: "var(--color-danger)", value: formatNumber(totals.failed) },
          ]}
          footer={
            <div className="flex items-center justify-between gap-3">
              <span>
                <span className="font-mono text-success-text">{successRate.toFixed(1)}%</span> success
                <span className="hidden sm:inline">
                  {" "}· <span className="font-mono text-ink">{formatNumber(Math.round((totals.runs * MINUTES_SAVED_PER_RUN) / 60))}</span> hours saved
                </span>
              </span>
              <Link to={routes.app.automations} className={buttonVariants({ variant: "ghost", size: "xs", className: "-mr-2 shrink-0" })}>
                Monitoring
                <ArrowRight />
              </Link>
            </div>
          }
        >
          <AreaChart
            data={points}
            index="label"
            series={[
              { key: "successful", label: "Successful", color: "var(--color-chart-4)" },
              { key: "failed", label: "Failed", color: "var(--color-danger)" },
            ]}
            valueFormatter={formatNumber}
            yAxisWidth={44}
            aria-label="Automation runs, successful and failed"
          />
        </ChartContainer>
      </div>
    </>
  );
}
