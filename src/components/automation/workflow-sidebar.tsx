import { AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2, Copy, MousePointerClick, Trash2, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDuration, formatNumber, formatRelative } from "@/lib/format";
import { nodeMeta, triggerEvents, withCurrent, type NodeField } from "@/lib/automation/nodes";
import type { FlowNode, WorkflowDoc, WorkflowStats, WorkflowStatus } from "@/lib/automation/types";
import type { DocAction, Issue } from "@/lib/automation/workflow";
import { Button, EmptyState, Input, Progress, Select, Tabs, Textarea } from "@/components/ui";

const statuses: { value: WorkflowStatus; label: string; dot: string }[] = [
  { value: "active", label: "Active", dot: "bg-success" },
  { value: "paused", label: "Paused", dot: "bg-warning" },
  { value: "draft", label: "Draft", dot: "bg-subtle" },
];

export const statusMetaFor = (status: WorkflowStatus) => statuses.find((s) => s.value === status)!;

function Stat({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-white px-3 py-2.5", className)}>
      <p className="text-xs text-muted">{label}</p>
      <div className="mt-0.5 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function SettingsPanel({
  doc,
  dispatch,
  stats,
  issues,
  now,
  onSelectNode,
  onAddTrigger,
}: {
  doc: WorkflowDoc;
  dispatch: (action: DocAction) => void;
  stats: WorkflowStats;
  issues: Issue[];
  now: number;
  onSelectNode: (id: string) => void;
  onAddTrigger: () => void;
}) {
  const trigger = doc.nodes.find((n) => n.type === "trigger");
  const rate = stats.runs ? (stats.successes / stats.runs) * 100 : 0;

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h3 className="type-overline text-subtle">Workflow settings</h3>
        <Input
          label="Name"
          value={doc.name}
          onChange={(e) => dispatch({ type: "rename", name: e.target.value })}
          onBlur={(e) => !e.target.value.trim() && dispatch({ type: "rename", name: "Untitled workflow" })}
          maxLength={60}
        />
        <div>
          <p className="mb-1.5 text-sm font-medium text-ink" id="wf-status-label">
            Status
          </p>
          <div role="radiogroup" aria-labelledby="wf-status-label" className="grid grid-cols-3 gap-1 rounded-lg bg-sunken p-1">
            {statuses.map((s) => {
              const active = doc.status === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => dispatch({ type: "status", status: s.value })}
                  className={cn(
                    "flex h-7 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors",
                    active ? "bg-white text-ink shadow-xs" : "text-muted hover:text-ink",
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", s.dot)} aria-hidden />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
        {trigger ? (
          <div>
            <Select
              label="Trigger"
              options={withCurrent(triggerEvents, trigger.config.event)}
              value={trigger.config.event}
              onChange={(e) => dispatch({ type: "node/update", id: trigger.id, config: { event: e.target.value } })}
            />
            <button type="button" onClick={() => onSelectNode(trigger.id)} className="mt-1.5 text-xs font-medium text-primary hover:underline">
              Edit trigger step
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border-strong p-3 text-center">
            <p className="text-sm font-medium text-ink">No trigger</p>
            <p className="mt-0.5 text-xs text-muted">Workflows need a trigger to start.</p>
            <Button size="xs" variant="secondary" className="mt-2" onClick={onAddTrigger}>
              Add trigger
            </Button>
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="type-overline text-subtle">Performance</h3>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Last run" value={stats.lastRunAt ? formatRelative(stats.lastRunAt, now) : "Never"} />
          <Stat label="Runs" value={<span className="font-mono tabular-nums">{formatNumber(stats.runs)}</span>} />
          <Stat
            className="col-span-2"
            label="Success rate"
            value={
              <div className="flex items-center gap-3">
                <span className="font-mono tabular-nums">{rate.toFixed(1)}%</span>
                <Progress value={rate} tone={rate >= 95 ? "success" : rate >= 85 ? "warning" : "danger"} size="sm" className="flex-1" />
              </div>
            }
          />
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="type-overline text-subtle">Checks</h3>
        {issues.length === 0 ? (
          <p className="flex items-center gap-2 rounded-lg bg-success-soft px-3 py-2 text-xs font-medium text-success-text">
            <CheckCircle2 className="size-4" /> Every step is connected and configured
          </p>
        ) : (
          <ul className="space-y-1.5">
            {issues.map((issue) => (
              <li key={issue.id}>
                <button
                  type="button"
                  disabled={!issue.nodeId}
                  onClick={() => issue.nodeId && onSelectNode(issue.nodeId)}
                  className="flex w-full items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-left text-xs text-warning-text transition-colors enabled:hover:bg-warning-soft/70"
                >
                  <AlertTriangle className="mt-px size-3.5 shrink-0" />
                  {issue.message}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="type-overline text-subtle">Recent runs</h3>
        <ul className="divide-y divide-border rounded-lg border border-border bg-white">
          {stats.history.map((r) => (
            <li key={r.id} className="flex items-center gap-2.5 px-3 py-2">
              {r.ok ? <CheckCircle2 className="size-4 shrink-0 text-success" /> : <XCircle className="size-4 shrink-0 text-danger" />}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-ink">
                  {r.lead}
                  {r.test && <span className="ml-1.5 rounded bg-sunken px-1 py-px text-2xs font-medium text-muted">Test</span>}
                </span>
                <span className="block text-2xs text-muted">
                  {r.ok ? `${r.steps} steps` : "Failed at webhook"}
                  {r.branch && ` · ${r.branch === "yes" ? "Yes" : "No"} path`} · {formatDuration(r.durationMs)}
                </span>
              </span>
              <span className="shrink-0 text-2xs text-subtle">{formatRelative(r.at, now)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: NodeField; value: string; onChange: (value: string) => void }) {
  if (field.kind === "select") {
    return <Select label={field.label} options={withCurrent(field.options, value)} value={value} onChange={(e) => onChange(e.target.value)} />;
  }
  if (field.kind === "textarea") {
    return <Textarea label={field.label} value={value} placeholder={field.placeholder} rows={3} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <Input
      label={field.label}
      type={field.kind === "number" ? "number" : "text"}
      min={field.kind === "number" ? 0 : undefined}
      value={value}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function InspectorPanel({
  node,
  doc,
  dispatch,
  onSelectNode,
  onDelete,
  onDuplicate,
}: {
  node: FlowNode;
  doc: WorkflowDoc;
  dispatch: (action: DocAction) => void;
  onSelectNode: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const meta = nodeMeta[node.type];
  const Icon = meta.icon;
  const incoming = doc.edges.filter((e) => e.to === node.id);
  const outgoing = doc.edges.filter((e) => e.from === node.id);
  const title = (id: string) => doc.nodes.find((n) => n.id === id)?.title ?? "Unknown";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset [&_svg]:size-5", meta.chip)}>
          <Icon />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{meta.label}</p>
          <p className="text-xs text-muted">{meta.description}</p>
        </div>
      </div>

      <section className="space-y-4">
        <Input
          label="Step name"
          value={node.title}
          maxLength={40}
          onChange={(e) => dispatch({ type: "node/update", id: node.id, title: e.target.value })}
          onBlur={(e) => !e.target.value.trim() && dispatch({ type: "node/update", id: node.id, title: meta.defaults.title })}
        />
        {meta.fields
          .filter((f) => !(node.type === "crm" && f.key === "assignee" && node.config.action !== "assign"))
          .map((field) => (
            <FieldInput
              key={field.key}
              field={field}
              value={node.config[field.key] ?? ""}
              onChange={(value) => dispatch({ type: "node/update", id: node.id, config: { [field.key]: value } })}
            />
          ))}
      </section>

      <section className="space-y-2">
        <h3 className="type-overline text-subtle">Connections</h3>
        <ul className="space-y-1 text-xs">
          {node.type !== "trigger" &&
            (incoming.length ? (
              incoming.map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => onSelectNode(e.from)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-muted hover:bg-sunken hover:text-ink">
                    <ArrowUpRight className="size-3.5 rotate-180" /> From <span className="font-medium text-ink">{title(e.from)}</span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-2 py-1.5 text-warning-text">Not connected to a previous step</li>
            ))}
          {outgoing.map((e) => (
            <li key={e.id}>
              <button type="button" onClick={() => onSelectNode(e.to)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-muted hover:bg-sunken hover:text-ink">
                <ArrowDownRight className="size-3.5" />
                {e.port === "out" ? "Then" : e.port === "yes" ? "If yes" : "If no"} <span className="font-medium text-ink">{title(e.to)}</span>
              </button>
            </li>
          ))}
          {outgoing.length === 0 && <li className="px-2 py-1.5 text-muted">Last step. Drag from its bottom port to continue.</li>}
        </ul>
      </section>

      <div className="flex gap-2 border-t border-border pt-4">
        <Button variant="secondary" size="sm" leftIcon={<Copy />} onClick={() => onDuplicate(node.id)}>
          Duplicate
        </Button>
        <Button variant="danger" size="sm" leftIcon={<Trash2 />} onClick={() => onDelete(node.id)}>
          Delete step
        </Button>
      </div>
    </div>
  );
}

export type SidebarTab = "workflow" | "step";

type WorkflowSidebarProps = {
  tab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  doc: WorkflowDoc;
  dispatch: (action: DocAction) => void;
  stats: WorkflowStats;
  issues: Issue[];
  now: number;
  selectedNode: FlowNode | null;
  onSelectNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onAddTrigger: () => void;
};

export function WorkflowSidebar({
  tab,
  onTabChange,
  doc,
  dispatch,
  stats,
  issues,
  now,
  selectedNode,
  onSelectNode,
  onDeleteNode,
  onDuplicateNode,
  onAddTrigger,
}: WorkflowSidebarProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-4 pt-3">
        <Tabs
          value={tab}
          onValueChange={(v) => onTabChange(v as SidebarTab)}
          items={[
            { value: "workflow", label: "Workflow" },
            { value: "step", label: "Step", count: issues.filter((i) => i.nodeId === selectedNode?.id).length || undefined },
          ]}
        />
      </div>
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {tab === "workflow" ? (
          <SettingsPanel
            doc={doc}
            dispatch={dispatch}
            stats={stats}
            issues={issues}
            now={now}
            onSelectNode={onSelectNode}
            onAddTrigger={onAddTrigger}
          />
        ) : selectedNode ? (
          <InspectorPanel
            key={selectedNode.id}
            node={selectedNode}
            doc={doc}
            dispatch={dispatch}
            onSelectNode={onSelectNode}
            onDelete={onDeleteNode}
            onDuplicate={onDuplicateNode}
          />
        ) : (
          <EmptyState
            size="sm"
            icon={<MousePointerClick />}
            title="Select a step"
            description="Click any step on the canvas to edit its settings."
          />
        )}
      </div>
    </div>
  );
}
