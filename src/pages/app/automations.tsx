import { useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import {
  Activity,
  CheckCircle2,
  MoreHorizontal,
  Pause,
  Play,
  Search,
  Workflow,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { distribute } from "@/lib/distribute";
import { formatDuration, formatNumber, formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useUser } from "@/lib/auth/auth-context";
import { useCrm } from "@/lib/crm/crm-context";
import { FAILED_TODAY, RUNS_TODAY, workflows, type WorkflowInfo } from "@/lib/automation/catalog";
import { buildExecution, generateExecutions, hourlyRuns, type Execution } from "@/lib/automation/executions";
import { defaultStored, readStored, writeStored, type StoredWorkflow } from "@/lib/automation/storage";
import type { WorkflowStatus } from "@/lib/automation/types";
import { mulberry32 } from "@/lib/crm/seed";
import { useNow } from "@/hooks/use-now";
import {
  AnimatedNumber,
  Badge,
  BarChart,
  Button,
  buttonVariants,
  Card,
  ChartContainer,
  Dropdown,
  Input,
  Pagination,
  Table,
  Tabs,
  useToast,
  type Column,
  type SortState,
} from "@/components/ui";
import { ExecutionDrawer } from "@/components/automation/execution-drawer";

const PAGE_SIZE = 8;

type Row = WorkflowInfo & { effectiveStatus: WorkflowStatus; displayName: string; lastRunAt: number | null; successRate: number | null };

const statusBadge: Record<WorkflowStatus, { label: string; variant: "success" | "warning" | "neutral" }> = {
  active: { label: "Active", variant: "success" },
  paused: { label: "Paused", variant: "warning" },
  draft: { label: "Draft", variant: "neutral" },
};

function StatTile({
  label,
  value,
  detail,
  icon,
  tone,
  onClick,
  active,
}: {
  label: string;
  value: number;
  detail: ReactNode;
  icon: ReactNode;
  tone: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-pressed={onClick ? active : undefined}
      className={cn(
        "flex min-w-0 flex-col rounded-lg border bg-white p-4 text-left shadow-sm outline-none transition-[border-color,box-shadow] duration-150 sm:p-5",
        active ? "border-danger-border shadow-[0_0_0_3px_var(--color-danger-soft)]" : "border-border",
        onClick && "hover:border-border-strong hover:shadow-md focus-visible:border-primary focus-visible:shadow-focus",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-muted">{label}</span>
        <span className={cn("hidden size-7 shrink-0 items-center justify-center rounded-md ring-1 ring-inset sm:flex [&_svg]:size-3.5", tone)}>{icon}</span>
      </span>
      <AnimatedNumber
        value={value}
        format={(v) => formatNumber(Math.round(v))}
        className="mt-3 block font-mono text-xl font-semibold tabular-nums tracking-tight text-ink sm:text-2xl"
      />
      <span className="mt-1 truncate text-xs text-subtle">{detail}</span>
    </Comp>
  );
}

export default function AutomationsPage() {
  const user = useUser();
  const now = useNow(30_000);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state } = useCrm();
  const [mountedAt] = useState(() => Date.now());
  const [stored, setStored] = useState<Record<string, StoredWorkflow | null>>(() =>
    Object.fromEntries(workflows.map((w) => [w.id, readStored(user.id, w.id)])),
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | WorkflowStatus>("all");
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(1);
  const [workflowFilter, setWorkflowFilter] = useState<string | null>(null);
  const [failedOnly, setFailedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [retries, setRetries] = useState<Execution[]>([]);
  const [openExecution, setOpenExecution] = useState<Execution | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const executionsRef = useRef<HTMLDivElement>(null);

  const rows = useMemo<Row[]>(
    () =>
      workflows.map((w) => {
        const s = stored[w.id];
        const baseLast = w.lastRunMinutes >= 0 ? mountedAt - w.lastRunMinutes * 60_000 : null;
        const lastRunAt = Math.max(baseLast ?? 0, s?.stats.lastRunAt ?? 0) || null;
        return {
          ...w,
          effectiveStatus: s?.saved.status ?? w.status,
          displayName: s?.saved.name || w.name,
          lastRunAt,
          successRate: w.runsToday ? ((w.runsToday - w.failedToday) / w.runsToday) * 100 : null,
        };
      }),
    [stored, mountedAt],
  );

  const counts = useMemo(
    () => ({
      all: rows.length,
      active: rows.filter((r) => r.effectiveStatus === "active").length,
      paused: rows.filter((r) => r.effectiveStatus === "paused").length,
      draft: rows.filter((r) => r.effectiveStatus === "draft").length,
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter(
      (r) =>
        (statusFilter === "all" || r.effectiveStatus === statusFilter) &&
        (!q || r.displayName.toLowerCase().includes(q) || r.trigger.toLowerCase().includes(q)),
    );
    if (!sort) return list;
    const value = (r: Row): string | number =>
      sort.key === "name" ? r.displayName.toLowerCase() : sort.key === "runs" ? r.runsToday : sort.key === "success" ? (r.successRate ?? -1) : (r.lastRunAt ?? 0);
    return [...list].sort((a, b) => {
      const av = value(a);
      const bv = value(b);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.direction === "asc" ? cmp : -cmp;
    });
  }, [rows, query, statusFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const [feedLeads] = useState(() => state.leads);
  const generated = useMemo(() => generateExecutions(workflows, feedLeads, mountedAt), [feedLeads, mountedAt]);
  const executions = useMemo(() => [...retries, ...generated], [retries, generated]);
  const shownExecutions = executions.filter(
    (e) => (!workflowFilter || e.workflowId === workflowFilter) && (!failedOnly || e.status === "failed"),
  );
  const hourly = useMemo(() => hourlyRuns(RUNS_TODAY, FAILED_TODAY, mountedAt, distribute), [mountedAt]);

  const setStatus = (row: Row, status: WorkflowStatus) => {
    const current = stored[row.id] ?? defaultStored(row, state.leads);
    const next = { ...current, saved: { ...current.saved, status } };
    writeStored(user.id, row.id, next);
    setStored((s) => ({ ...s, [row.id]: next }));
    toast({
      title: status === "paused" ? `Paused “${row.displayName}”` : `Resumed “${row.displayName}”`,
      description: status === "paused" ? "New events won't start runs until you resume it." : "New events will start runs again.",
      variant: status === "paused" ? "warning" : "success",
      action: { label: "Undo", onClick: () => setStatus({ ...row, effectiveStatus: status }, row.effectiveStatus) },
    });
  };

  const focusWorkflow = (id: string | null) => {
    setWorkflowFilter(id);
    setVisibleCount(8);
    if (id) window.setTimeout(() => executionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const openDrawer = (execution: Execution) => {
    setOpenExecution(execution);
    setDrawerOpen(true);
  };

  const retry = (execution: Execution) => {
    const workflow = workflows.find((w) => w.id === execution.workflowId);
    const lead = state.leads.find((l) => l.id === execution.leadId);
    if (!workflow || !lead) return;
    const run = { ...buildExecution(workflow, lead, Date.now(), null, mulberry32(Date.now() % 100000), `ex_retry_${Date.now().toString(36)}`), retryOf: execution.id };
    setRetries((list) => [run, ...list]);
    setOpenExecution(run);
    toast({ title: "Retry succeeded", description: `${workflow.name} completed for ${lead.name}. Simulated in demo mode.`, variant: "success" });
  };

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Workflow",
      sortValue: (r) => r.displayName,
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{r.displayName}</p>
          <p className="truncate text-xs text-muted">{r.trigger}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "w-28",
      cell: (r) => (
        <Badge variant={statusBadge[r.effectiveStatus].variant} dot>
          {statusBadge[r.effectiveStatus].label}
        </Badge>
      ),
    },
    {
      key: "runs",
      header: "Runs",
      align: "right",
      width: "w-24",
      sortValue: (r) => r.runsToday,
      cell: (r) => <span className="font-mono tabular-nums text-ink">{formatNumber(r.runsToday)}</span>,
    },
    {
      key: "success",
      header: "Success rate",
      width: "w-44",
      className: "hidden md:table-cell",
      sortValue: (r) => r.successRate ?? -1,
      cell: (r) =>
        r.successRate === null ? (
          <span className="text-subtle">—</span>
        ) : (
          <span className="flex items-center gap-2.5">
            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-sunken" aria-hidden>
              <span
                className={cn("block h-full rounded-full", r.successRate >= 97 ? "bg-success" : r.successRate >= 90 ? "bg-warning" : "bg-danger")}
                style={{ width: `${r.successRate}%` }}
              />
            </span>
            <span className="font-mono text-sm tabular-nums text-ink">{r.successRate.toFixed(1)}%</span>
          </span>
        ),
    },
    {
      key: "last",
      header: "Last run",
      width: "w-28",
      className: "hidden sm:table-cell",
      sortValue: (r) => r.lastRunAt ?? 0,
      cell: (r) => <span className="text-sm text-muted">{r.lastRunAt ? formatRelative(r.lastRunAt, now) : "Never"}</span>,
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      width: "w-12",
      align: "right",
      cell: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            align="end"
            width="w-48"
            trigger={({ open, ...props }) => (
              <Button {...props} variant="ghost" size="icon-sm" aria-label={`Actions for ${r.displayName}`} className={cn(open && "bg-sunken")}>
                <MoreHorizontal />
              </Button>
            )}
            items={[
              { label: "Open in builder", icon: <Workflow />, onSelect: () => navigate(routes.app.automation(r.id)) },
              { label: "View executions", icon: <Activity />, onSelect: () => focusWorkflow(r.id), disabled: r.runsToday === 0 },
              ...(r.effectiveStatus === "draft"
                ? []
                : [
                    { type: "separator" as const },
                    r.effectiveStatus === "active"
                      ? { label: "Pause workflow", icon: <Pause />, onSelect: () => setStatus(r, "paused") }
                      : { label: "Resume workflow", icon: <Play />, onSelect: () => setStatus(r, "active") },
                  ]),
            ]}
          />
        </div>
      ),
    },
  ];

  const filterName = workflowFilter ? rows.find((r) => r.id === workflowFilter)?.displayName : null;
  const successRate = ((RUNS_TODAY - FAILED_TODAY) / RUNS_TODAY) * 100;

  return (
    <>
      <title>Automations · NEXORA AI</title>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Automation monitoring</h1>
          <p className="mt-1 text-base text-muted">Health and activity for every workflow in your workspace.</p>
        </div>
        <Link to={routes.app.automation("lead-qualification")} className={buttonVariants({ size: "sm", className: "self-start sm:self-auto" })}>
          <Workflow />
          Open builder
        </Link>
      </header>

      <section aria-label="Automation metrics" className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile
          label="Active Workflows"
          value={counts.active}
          detail={`of ${counts.all} workflows`}
          icon={<Workflow />}
          tone="bg-primary-soft/60 text-primary ring-primary-border"
        />
        <StatTile
          label="Runs Today"
          value={RUNS_TODAY}
          detail="Last 24 hours"
          icon={<Activity />}
          tone="bg-accent-soft text-accent ring-accent-border"
        />
        <StatTile
          label="Successful"
          value={RUNS_TODAY - FAILED_TODAY}
          detail={`${successRate.toFixed(1)}% success rate`}
          icon={<CheckCircle2 />}
          tone="bg-success-soft text-success-text ring-success-border"
        />
        <StatTile
          label="Failed"
          value={FAILED_TODAY}
          detail={failedOnly ? "Showing failed runs below" : "Click to review failed runs"}
          icon={<XCircle />}
          tone="bg-danger-soft text-danger-text ring-danger-border"
          active={failedOnly}
          onClick={() => {
            setFailedOnly((v) => !v);
            setVisibleCount(8);
            window.setTimeout(() => executionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
          }}
        />
      </section>

      <Card className="mt-4">
        <div className="flex flex-col gap-3 px-5 pt-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="type-h3">Workflows</h2>
            <p className="mt-0.5 text-sm text-muted">Runs and success rate over the last 24 hours. Select a row to see its executions.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Tabs
              variant="segmented"
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as typeof statusFilter);
                setPage(1);
              }}
              items={[
                { value: "all", label: "All", count: counts.all },
                { value: "active", label: "Active", count: counts.active },
                { value: "paused", label: "Paused", count: counts.paused },
                { value: "draft", label: "Draft", count: counts.draft },
              ]}
            />
            <Input
              size="sm"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search workflows"
              leftIcon={<Search />}
              aria-label="Search workflows"
              containerClassName="sm:w-56"
            />
          </div>
        </div>
        <div className="mt-4">
          <Table<Row>
            columns={columns}
            rows={pageRows}
            getRowId={(r) => r.id}
            onRowClick={(r) => (r.runsToday > 0 ? focusWorkflow(r.id) : navigate(routes.app.automation(r.id)))}
            activeRowId={workflowFilter ?? undefined}
            sort={sort}
            onSortChange={(next) => {
              setSort(next);
              setPage(1);
            }}
            density="compact"
            empty={<p className="py-10 text-center text-sm text-muted">No workflows match your filters.</p>}
          />
        </div>
        {pageCount > 1 && (
          <div className="border-t border-border px-5 py-3">
            <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} pageSize={PAGE_SIZE} total={filtered.length} />
          </div>
        )}
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <ChartContainer
          className="xl:col-span-7"
          title="Runs by hour"
          metric={formatNumber(RUNS_TODAY)}
          description="Last 24 hours, successful and failed"
          legend={[
            { label: "Successful", color: "var(--color-chart-1)" },
            { label: "Failed", color: "var(--color-danger)" },
          ]}
          height={300}
        >
          <BarChart
            data={hourly}
            index="label"
            layout="stacked"
            series={[
              { key: "successful", label: "Successful", color: "var(--color-chart-1)" },
              { key: "failed", label: "Failed", color: "var(--color-danger)" },
            ]}
            valueFormatter={formatNumber}
            yAxisWidth={36}
            maxBarWidth={18}
            aria-label="Automation runs per hour over the last 24 hours"
          />
        </ChartContainer>

        <div ref={executionsRef} className="flex scroll-mt-20 flex-col xl:col-span-5">
        <Card className="flex flex-1 flex-col">
          <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
            <div>
              <h2 className="type-h3">Recent executions</h2>
              <p className="mt-0.5 text-sm text-muted">Select a run to see each step.</p>
            </div>
            <Tabs
              variant="segmented"
              value={failedOnly ? "failed" : "all"}
              onValueChange={(v) => {
                setFailedOnly(v === "failed");
                setVisibleCount(8);
              }}
              items={[
                { value: "all", label: "All" },
                { value: "failed", label: "Failed" },
              ]}
            />
          </div>
          {filterName && (
            <div className="px-5 pt-3">
              <Badge variant="primary" size="md" onRemove={() => focusWorkflow(null)}>
                {filterName}
              </Badge>
            </div>
          )}
          <ul className="mt-3 flex-1 divide-y divide-border border-t border-border">
            {shownExecutions.slice(0, visibleCount).map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => openDrawer(e)}
                  className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none"
                >
                  {e.status === "success" ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Succeeded" />
                  ) : (
                    <XCircle className="size-4 shrink-0 text-danger" aria-label="Failed" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{e.workflowName}</span>
                    <span className="block truncate text-xs text-muted">
                      {e.leadName} ·{" "}
                      {e.status === "failed"
                        ? `failed at ${e.steps.find((s) => s.status === "failed")?.label.toLowerCase()}`
                        : `${e.steps.length} steps`}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-xs text-muted">{formatRelative(e.finishedAt, now)}</span>
                    <span className="block font-mono text-2xs tabular-nums text-subtle">{formatDuration(e.finishedAt - e.startedAt)}</span>
                  </span>
                </button>
              </li>
            ))}
            {shownExecutions.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-muted">
                No {failedOnly ? "failed " : ""}executions{filterName ? ` for ${filterName}` : ""} today.
              </li>
            )}
          </ul>
          {shownExecutions.length > visibleCount && (
            <div className="border-t border-border px-5 py-2.5">
              <Button variant="ghost" size="sm" className="w-full" onClick={() => setVisibleCount((n) => n + 8)}>
                Show more ({shownExecutions.length - visibleCount} remaining)
              </Button>
            </div>
          )}
          {(workflowFilter || failedOnly) && shownExecutions.length > 0 && (
            <p className="flex items-center justify-between border-t border-border px-5 py-2.5 text-xs text-muted">
              Showing {Math.min(visibleCount, shownExecutions.length)} of {shownExecutions.length} recent runs
              <button
                type="button"
                onClick={() => {
                  focusWorkflow(null);
                  setFailedOnly(false);
                }}
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                <X className="size-3" /> Clear filters
              </button>
            </p>
          )}
        </Card>
        </div>
      </div>

      <ExecutionDrawer
        open={drawerOpen}
        execution={openExecution}
        onClose={() => setDrawerOpen(false)}
        onRetry={retry}
        retried={openExecution !== null && retries.some((r) => r.retryOf === openExecution.id)}
      />
    </>
  );
}
