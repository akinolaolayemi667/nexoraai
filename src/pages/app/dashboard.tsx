import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useReducedMotion } from "framer-motion";
import { Download, Sparkles } from "lucide-react";
import { routes } from "@/lib/routes";
import { useUser } from "@/lib/auth/auth-context";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Button, buttonVariants, useToast } from "@/components/ui";
import { AiInsightsCard, InsightsDrawer } from "@/components/dashboard/ai-insights";
import { leadSeries, metrics, pipelineStages } from "@/components/dashboard/dashboard-data";
import { LeadPerformance } from "@/components/dashboard/lead-performance";
import { LeadSources } from "@/components/dashboard/lead-sources";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { PipelineSummary } from "@/components/dashboard/pipeline-summary";
import { useInsights } from "@/components/dashboard/use-insights";

function greeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function downloadReport() {
  const rows = [
    ["Section", "Label", "Value"],
    ...metrics.map((m) => ["Metric", m.label, String(m.value)]),
    ...pipelineStages.map((s) => ["Pipeline", `${s.name} (${s.deals} deals)`, String(s.value)]),
    ...leadSeries("30d").map((p) => ["Leads", p.label, `${p.leads} leads / ${p.qualified} qualified / ${p.converted} converted`]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: "nexora-overview.csv" });
  link.click();
  URL.revokeObjectURL(url);
}

export default function DashboardPage() {
  const user = useUser();
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();
  const insightsDrawer = useDisclosure();
  const [exporting, setExporting] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const now = new Date();
  const firstName = user.name.split(/\s+/)[0];

  const { active, dismissedCount, status, run, dismiss, restoreAll } = useInsights((target) => {
    window.setTimeout(
      () => {
        document.getElementById(target)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        setHighlighted(target);
      },
      insightsDrawer.isOpen ? 320 : 0,
    );
  });

  useEffect(() => {
    if (!highlighted) return;
    const timer = window.setTimeout(() => setHighlighted(null), 1800);
    return () => window.clearTimeout(timer);
  }, [highlighted]);

  useEffect(() => {
    if (!exporting) return;
    const timer = window.setTimeout(() => {
      downloadReport();
      setExporting(false);
      toast({ variant: "success", title: "Report exported", description: "nexora-overview.csv is in your downloads." });
    }, 900);
    return () => window.clearTimeout(timer);
  }, [exporting, toast]);

  return (
    <>
      <title>Overview · NEXORA AI</title>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-subtle">
            {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(now)}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {greeting(now)}, {firstName}.
          </h1>
          <p className="mt-1 text-base text-muted">Here's what is happening across your business.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download />}
            loading={exporting}
            loadingText="Exporting…"
            onClick={() => setExporting(true)}
            className="flex-1 sm:flex-none"
          >
            Export
          </Button>
          <Link to={routes.app.ai} className={buttonVariants({ size: "sm", className: "flex-1 sm:flex-none" })}>
            <Sparkles />
            Ask AI
          </Link>
        </div>
      </header>

      <div className="mt-6">
        <MetricCards />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <LeadPerformance className="xl:col-span-8" />
        <AiInsightsCard
          className="xl:col-span-4"
          insights={active}
          status={status}
          onRun={run}
          onDismiss={dismiss}
          onViewAll={insightsDrawer.open}
        />
        <PipelineSummary className="xl:col-span-7" />
        <LeadSources className="xl:col-span-5" highlighted={highlighted === "lead-sources"} />
      </div>

      <InsightsDrawer
        open={insightsDrawer.isOpen}
        onClose={insightsDrawer.close}
        insights={active}
        dismissedCount={dismissedCount}
        status={status}
        onRun={run}
        onDismiss={dismiss}
        onRestore={restoreAll}
      />
    </>
  );
}
