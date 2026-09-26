import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, CheckSquare, DollarSign, Percent, Plus, Target } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCompact, formatCurrency, formatNumber } from "@/lib/format";
import { chartColor } from "@/lib/tokens";
import { currentUser } from "@/data/navigation";
import { AreaChart, Button, Card, ChartLegend, Progress, Sparkline, Tabs, useToast } from "@/components/ui";
import { AnimatedNumber } from "../animated-number";
import { AiInsights } from "./ai-insights";
import { PipelineActivity } from "./pipeline-activity";
import { PreviewShell } from "./preview-shell";
import { PreviewTasks } from "./preview-tasks";
import {
  OTHER_OPEN_TASKS,
  activityPool,
  initialActivity,
  initialTasks,
  ranges,
  type Activity,
  type Range,
} from "./preview-data";

const TICK_MS = 3200;
const COMPLETED_THIS_WEEK = 23;

function Trend({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono text-2xs font-medium tabular-nums",
        up ? "text-success-text" : "text-danger-text",
      )}
    >
      <Icon className="size-3" aria-hidden />
      {up ? "+" : ""}
      {value.toFixed(1)}
      {suffix}
    </span>
  );
}

function PreviewMetric({
  label,
  icon,
  value,
  footer,
  chart,
}: {
  label: string;
  icon: ReactNode;
  value: ReactNode;
  footer: ReactNode;
  chart?: ReactNode;
}) {
  return (
    <Card padding="none" className="flex flex-col gap-2 p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        <span className="text-subtle [&_svg]:size-3.5">{icon}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="text-metric text-xl font-semibold text-ink">{value}</div>
          <div className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-2xs text-subtle">{footer}</div>
        </div>
        {chart && <div className="hidden h-8 w-16 shrink-0 sm:block">{chart}</div>}
      </div>
    </Card>
  );
}

export function DashboardPreview({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const reduced = useReducedMotion();
  const live = inView && !reduced;
  const { toast } = useToast();

  const [range, setRange] = useState<Range>("30d");
  const [boost, setBoost] = useState({ revenue: 0, leads: 0 });
  const [now, setNow] = useState(() => Date.now());
  const [activity, setActivity] = useState<Activity[]>(() => initialActivity(Date.now()));
  const [tasks, setTasks] = useState(initialTasks);
  const nextActivity = useRef(4);

  useEffect(() => {
    if (!live) return;
    let tick = 0;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      tick += 1;
      const timestamp = Date.now();
      setNow(timestamp);
      setBoost((b) => ({
        revenue: b.revenue + 180 + Math.round(Math.random() * 720),
        leads: b.leads + (Math.random() > 0.45 ? 1 : 0),
      }));
      if (tick % 2 === 0) {
        const n = nextActivity.current++;
        const template = activityPool[n % activityPool.length];
        setActivity((list) => [{ ...template, id: n, createdAt: timestamp }, ...list].slice(0, 4));
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [live]);

  const data = ranges[range];
  const series = useMemo(
    () =>
      data.series.map((point, i) =>
        i === data.series.length - 1 ? { ...point, current: point.current + boost.revenue } : point,
      ),
    [data, boost.revenue],
  );

  const revenue = data.revenue + boost.revenue;
  const leads = data.leads + boost.leads;
  const conversion = data.conversion + Math.min(0.4, boost.leads * 0.02);
  const openTasks = OTHER_OPEN_TASKS + tasks.filter((t) => !t.done).length;
  const doneTasks = COMPLETED_THIS_WEEK + tasks.filter((t) => t.done).length;
  const dueToday = tasks.filter((t) => t.due === "Today" && !t.done).length + 1;

  function changeRange(next: string) {
    setRange(next as Range);
    setBoost({ revenue: 0, leads: 0 });
  }

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Interactive preview of the NEXORA dashboard"
      className={className}
    >
      <PreviewShell>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-lg font-semibold text-ink">
                Good morning, {currentUser.name.split(" ")[0]}
              </p>
              <p className="text-xs text-muted">Here's what's happening across {currentUser.workspace} today.</p>
            </div>
            <div className="flex items-center gap-2">
              <Tabs
                variant="segmented"
                value={range}
                onValueChange={changeRange}
                items={[
                  { value: "7d", label: "7D" },
                  { value: "30d", label: "30D" },
                  { value: "90d", label: "90D" },
                ]}
              />
              <Button
                size="sm"
                leftIcon={<Plus />}
                className="hidden sm:inline-flex"
                onClick={() =>
                  toast({ title: "This is a live preview", description: "Start free to add your first lead in NEXORA." })
                }
              >
                New lead
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <PreviewMetric
              label="Revenue"
              icon={<DollarSign />}
              value={<AnimatedNumber value={revenue} format={(v) => formatCurrency(Math.round(v))} />}
              footer={
                <>
                  <Trend value={data.revenueChange} /> vs prev.
                </>
              }
              chart={<Sparkline data={series.map((p) => p.current)} className="h-8 w-16" />}
            />
            <PreviewMetric
              label="Leads"
              icon={<Target />}
              value={<AnimatedNumber value={leads} format={(v) => formatNumber(Math.round(v))} />}
              footer={
                <>
                  <Trend value={data.leadsChange} /> vs prev.
                </>
              }
              chart={
                <Sparkline
                  data={series.map((p) => p.previous)}
                  color="var(--color-chart-2)"
                  className="h-8 w-16"
                />
              }
            />
            <PreviewMetric
              label="Conversion rate"
              icon={<Percent />}
              value={<AnimatedNumber value={conversion} format={(v) => `${v.toFixed(1)}%`} />}
              footer={
                <span className="flex w-full flex-col gap-1.5">
                  <span className="flex items-center gap-1.5">
                    <Trend value={data.conversionChange} suffix=" pts" /> goal 6.0%
                  </span>
                  <Progress value={conversion} max={6} size="sm" className="w-full" />
                </span>
              }
            />
            <PreviewMetric
              label="Tasks"
              icon={<CheckSquare />}
              value={
                <>
                  <AnimatedNumber value={openTasks} format={(v) => String(Math.round(v))} />
                  <span className="ml-1 font-sans text-xs font-normal text-muted">open</span>
                </>
              }
              footer={
                <span className="flex w-full flex-col gap-1.5">
                  <span>
                    <span className="font-medium text-warning-text">{dueToday} due today</span> · {doneTasks} done
                  </span>
                  <Progress value={doneTasks} max={doneTasks + openTasks} tone="success" size="sm" className="w-full" />
                </span>
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <Card padding="none" className="flex flex-col lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4">
                <div>
                  <p className="text-sm font-semibold text-ink">Revenue</p>
                  <p className="text-xs text-muted">
                    <span className="text-metric text-ink">${formatCompact(revenue)}</span> this period
                  </p>
                </div>
                <ChartLegend
                  items={[
                    { label: "This period", color: chartColor(0) },
                    { label: "Previous period", color: chartColor(5) },
                  ]}
                />
              </div>
              <div className="h-52 px-3 pb-3 pt-2">
                <AreaChart
                  data={series}
                  index="label"
                  series={[
                    { key: "current", label: "This period", color: chartColor(0) },
                    { key: "previous", label: "Previous period", color: chartColor(5) },
                  ]}
                  valueFormatter={(v) => `$${formatCompact(v)}`}
                  yAxisWidth={40}
                  aria-label="Revenue this period compared with the previous period"
                />
              </div>
            </Card>
            <AiInsights live={live} />
          </div>

          <div className="hidden grid-cols-1 gap-3 sm:grid lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PipelineActivity activity={activity} now={now} live={live} />
            </div>
            <PreviewTasks
              tasks={tasks}
              onToggle={(id) => setTasks((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))}
            />
          </div>
        </div>
      </PreviewShell>
    </div>
  );
}
