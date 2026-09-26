import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Check,
  GitBranch,
  Kanban,
  Sparkles,
  UserPlus,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCompact } from "@/lib/format";
import { duration, ease } from "@/lib/motion";
import { chartColor } from "@/lib/tokens";
import { Avatar, Badge, BarChart, Button } from "@/components/ui";
import { Section, SectionHeading } from "./section";

function ModuleCard({
  id,
  icon: Icon,
  name,
  title,
  description,
  bullets,
  visual,
  className,
}: {
  id: string;
  icon: LucideIcon;
  name: string;
  title: string;
  description: string;
  bullets: string[];
  visual: ReactNode;
  className?: string;
}) {
  return (
    <article
      id={id}
      className={cn("flex scroll-mt-24 flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm", className)}
    >
      <div className="relative h-72 overflow-hidden border-b border-border bg-canvas p-5">{visual}</div>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <Icon className="size-4" aria-hidden />
          {name}
        </p>
        <h3 className="type-h3 mt-2">{title}</h3>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2 text-sm text-ink">
              <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

const workflowSteps = [
  { icon: Zap, label: "Trigger", text: "New lead from website form", tone: "bg-primary-soft text-primary-active" },
  { icon: Sparkles, label: "AI", text: "Score and enrich the lead", tone: "bg-accent-soft text-accent-hover" },
  { icon: GitBranch, label: "Condition", text: "Lead score is 80 or higher", tone: "bg-warning-soft text-warning-text" },
];

function WorkflowNode({
  icon: Icon,
  label,
  text,
  tone,
  active,
  className,
}: {
  icon: LucideIcon;
  label: string;
  text: string;
  tone: string;
  active: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-md border bg-white px-3 py-2 shadow-xs transition-[border-color,box-shadow] duration-300",
        active ? "border-primary shadow-focus" : "border-border",
        className,
      )}
    >
      <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-sm", tone)}>
        <Icon className="size-3.5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-2xs font-medium uppercase tracking-wider text-subtle">{label}</span>
        <span className="block truncate text-xs font-medium text-ink">{text}</span>
      </span>
    </div>
  );
}

function AutomationVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % 5), 1300);
    return () => window.clearInterval(id);
  }, [inView, reduced]);

  const connector = <div className="mx-auto h-3 w-px bg-border-strong" aria-hidden />;

  return (
    <div ref={ref} className="mx-auto flex h-full max-w-sm flex-col justify-center" aria-hidden>
      {workflowSteps.map((step, i) => (
        <div key={step.label}>
          <WorkflowNode {...step} active={active === i} />
          {connector}
        </div>
      ))}
      <div className="relative mx-auto h-3 w-1/2 border-x border-t border-border-strong" />
      <div className="grid grid-cols-2 gap-3">
        <WorkflowNode
          icon={UserPlus}
          label="Yes"
          text="Assign to sales"
          tone="bg-success-soft text-success-text"
          active={active === 3}
        />
        <WorkflowNode
          icon={Workflow}
          label="No"
          text="Add to nurture"
          tone="bg-sunken text-muted"
          active={active === 4}
        />
      </div>
    </div>
  );
}

const kanban = [
  {
    stage: "Qualified",
    deals: [
      { company: "Kestrel Studio", value: 18000, owner: "Priya Shah" },
      { company: "Meridian Foods", value: 36000, owner: "Leo Grant" },
    ],
  },
  {
    stage: "Proposal",
    deals: [
      { company: "Brightline", value: 48000, owner: "Olayemi Akinola", hot: true },
      { company: "Aurora Retail", value: 22000, owner: "Priya Shah" },
    ],
  },
  {
    stage: "Won",
    deals: [{ company: "Stackfield", value: 31000, owner: "Olayemi Akinola", won: true }],
  },
];

function CrmVisual() {
  return (
    <div className="grid h-full grid-cols-3 gap-3" aria-hidden>
      {kanban.map((column, ci) => (
        <div key={column.stage} className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center gap-1.5 px-0.5">
            <span className="size-1.5 rounded-full" style={{ backgroundColor: chartColor(ci === 2 ? 3 : ci) }} />
            <span className="truncate text-xs font-medium text-ink">{column.stage}</span>
            <span className="ml-auto font-mono text-2xs text-subtle">{column.deals.length}</span>
          </div>
          {column.deals.map((deal, di) => (
            <motion.div
              key={deal.company}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: duration.slow, ease: ease.emphasized, delay: ci * 0.08 + di * 0.06 }}
              className="rounded-md border border-border bg-white p-2.5 shadow-xs"
            >
              <p className="truncate text-xs font-medium text-ink">{deal.company}</p>
              <p className="text-metric mt-0.5 text-xs text-muted">${formatCompact(deal.value)}</p>
              <div className="mt-2 flex items-center justify-between gap-1">
                <Avatar name={deal.owner} size="xs" />
                {"hot" in deal && deal.hot && (
                  <Badge variant="warning" size="sm" className="px-1 text-[0.625rem]">
                    Hot
                  </Badge>
                )}
                {"won" in deal && deal.won && (
                  <Badge variant="success" size="sm" className="px-1 text-[0.625rem]">
                    Won
                  </Badge>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}

function AiVisual() {
  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: 6 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.6 },
    transition: { duration: duration.slow, ease: ease.emphasized, delay },
  });

  return (
    <div className="flex h-full flex-col justify-center gap-3" aria-hidden>
      <motion.div {...reveal(0)} className="ml-auto max-w-[80%] rounded-lg rounded-br-xs bg-primary px-3 py-2 text-xs text-white">
        Which deals need attention this week?
      </motion.div>
      <motion.div {...reveal(0.35)} className="flex max-w-[92%] gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent text-white">
          <Sparkles className="size-3.5" />
        </span>
        <div className="rounded-lg rounded-tl-xs border border-border bg-white px-3 py-2.5 shadow-xs">
          <p className="text-xs text-ink">3 deals went quiet after receiving a proposal:</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {[
              ["Helio Energy", "$96K", "6 days"],
              ["Brightline", "$48K", "9 days"],
            ].map(([name, value, age]) => (
              <li key={name} className="flex items-center justify-between gap-4 rounded-sm bg-canvas px-2 py-1 text-2xs">
                <span className="font-medium text-ink">{name}</span>
                <span className="font-mono text-muted">
                  {value} · {age}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-2.5 flex gap-1.5">
            <Button size="xs" tabIndex={-1}>
              Draft follow-ups
            </Button>
            <Button size="xs" variant="secondary" tabIndex={-1}>
              View deals
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const analyticsData = [
  { month: "Apr", newBusiness: 52, expansion: 15 },
  { month: "May", newBusiness: 56, expansion: 19 },
  { month: "Jun", newBusiness: 54, expansion: 21 },
  { month: "Jul", newBusiness: 62, expansion: 23 },
  { month: "Aug", newBusiness: 66, expansion: 24 },
  { month: "Sep", newBusiness: 71, expansion: 29 },
];

function AnalyticsVisual() {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid grid-cols-3 gap-2" aria-hidden>
        {[
          ["MRR", "$118.4K", "+6.1%"],
          ["Win rate", "28.6%", "+2.4 pts"],
          ["Avg. deal", "$14.2K", "+9.8%"],
        ].map(([label, value, change]) => (
          <div key={label} className="rounded-md border border-border bg-white px-3 py-2 shadow-xs">
            <p className="text-2xs text-muted">{label}</p>
            <p className="text-metric text-sm font-semibold text-ink">{value}</p>
            <p className="font-mono text-2xs text-success-text">{change}</p>
          </div>
        ))}
      </div>
      <div className="min-h-0 flex-1 rounded-md border border-border bg-white p-2 shadow-xs">
        <BarChart
          data={analyticsData}
          index="month"
          layout="stacked"
          series={[
            { key: "newBusiness", label: "New business" },
            { key: "expansion", label: "Expansion" },
          ]}
          valueFormatter={(v) => `$${v}K`}
          yAxisWidth={40}
          maxBarWidth={28}
          aria-label="Monthly revenue by type"
        />
      </div>
    </div>
  );
}

export function Platform() {
  return (
    <Section id="platform">
      <SectionHeading
        eyebrow="Platform"
        title="One system for every part of your operation."
        description="Four core modules that share the same data, so every automation, insight and report is working from the full picture."
      />
      <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <ModuleCard
          id="automation"
          icon={Workflow}
          name="Automation"
          title="Workflows that run your business on autopilot."
          description="Build multi-step automations visually. Trigger on any event, branch on any field and let AI handle the judgement calls."
          bullets={["Visual builder", "AI decision steps", "Delays & branching", "Run history & retries"]}
          visual={<AutomationVisual />}
          className="lg:col-span-7"
        />
        <ModuleCard
          id="crm"
          icon={Kanban}
          name="CRM"
          title="A pipeline your team keeps up to date."
          description="Leads, contacts and deals update themselves from email, calls and meetings."
          bullets={["Auto-logged activity", "Lead scoring", "Custom stages", "Forecasting"]}
          visual={<CrmVisual />}
          className="lg:col-span-5"
        />
        <ModuleCard
          id="ai"
          icon={Sparkles}
          name="AI"
          title="An assistant that knows your business."
          description="Ask questions in plain English, get answers from your own data and delegate the follow-up."
          bullets={["Natural-language answers", "Drafted replies", "Risk alerts", "Next best actions"]}
          visual={<AiVisual />}
          className="lg:col-span-5"
        />
        <ModuleCard
          id="analytics"
          icon={BarChart3}
          name="Analytics"
          title="Live reporting, without spreadsheets."
          description="Revenue, pipeline and team performance in dashboards that update the moment your data does."
          bullets={["Custom dashboards", "Cohort & funnel reports", "Scheduled digests", "Goal tracking"]}
          visual={<AnalyticsVisual />}
          className="lg:col-span-7"
        />
      </div>
    </Section>
  );
}
