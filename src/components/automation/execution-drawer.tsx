import { Link } from "react-router";
import { AlertCircle, ArrowDown, CheckCircle2, Circle, RotateCcw, Workflow, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDate, formatDuration } from "@/lib/format";
import { routes } from "@/lib/routes";
import { nodeMeta } from "@/lib/automation/nodes";
import { runNumber, type Execution } from "@/lib/automation/executions";
import { Badge, Button, buttonVariants, Drawer } from "@/components/ui";

const clock = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 });

export function ExecutionStatusBadge({ status }: { status: Execution["status"] }) {
  return status === "success" ? (
    <Badge variant="success" icon={<CheckCircle2 />}>
      Succeeded
    </Badge>
  ) : (
    <Badge variant="danger" icon={<XCircle />}>
      Failed
    </Badge>
  );
}

type ExecutionDrawerProps = {
  open: boolean;
  execution: Execution | null;
  onClose: () => void;
  onRetry: (execution: Execution) => void;
  retried: boolean;
};

export function ExecutionDrawer({ open, execution, onClose, onRetry, retried }: ExecutionDrawerProps) {
  const completed = execution?.steps.filter((s) => s.status === "success").length ?? 0;

  return (
    <Drawer
      open={open && execution !== null}
      onClose={onClose}
      size="lg"
      title={execution?.workflowName ?? "Execution"}
      description={execution ? `Run ${runNumber(execution)} · ${formatDate(execution.startedAt)}` : undefined}
      footer={
        execution && (
          <>
            <Link to={routes.app.automation(execution.workflowId)} className={buttonVariants({ variant: "secondary", size: "sm" })}>
              <Workflow />
              Open workflow
            </Link>
            {execution.status === "failed" && (
              <Button size="sm" leftIcon={<RotateCcw />} onClick={() => onRetry(execution)} disabled={retried}>
                {retried ? "Retried" : "Retry run"}
              </Button>
            )}
          </>
        )
      }
    >
      {execution && (
        <div className="space-y-6">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
            {[
              { label: "Status", value: <ExecutionStatusBadge status={execution.status} /> },
              { label: "Started", value: clock.format(execution.startedAt).replace(/\.\d+/, "") },
              { label: "Duration", value: formatDuration(execution.finishedAt - execution.startedAt) },
              { label: "Steps", value: `${completed} of ${execution.steps.length}` },
            ].map((item) => (
              <div key={item.label} className="bg-white px-3 py-2.5">
                <dt className="text-2xs font-medium uppercase tracking-wider text-subtle">{item.label}</dt>
                <dd className="mt-1 text-sm font-medium text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>

          <p className="text-sm text-muted">
            Contact{" "}
            <Link to={routes.app.lead(execution.leadId)} className="font-medium text-primary hover:underline">
              {execution.leadName}
            </Link>
            {execution.retryOf && <span> · retry of a failed run</span>}
          </p>

          <section aria-label="Execution steps">
            <h3 className="type-overline mb-3 text-subtle">Timeline</h3>
            <ol>
              {execution.steps.map((step, i) => {
                const meta = nodeMeta[step.type];
                const Icon = meta.icon;
                const last = i === execution.steps.length - 1;
                const offset = step.at !== null ? step.at - execution.startedAt : null;
                return (
                  <li key={i} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "relative flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset [&_svg]:size-4",
                          step.status === "skipped" ? "bg-canvas text-subtle ring-border" : meta.chip,
                          step.status === "failed" && "bg-danger-soft text-danger-text ring-danger-border",
                        )}
                      >
                        <Icon />
                        <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-white [&_svg]:size-3.5">
                          {step.status === "success" ? (
                            <CheckCircle2 className="text-success" />
                          ) : step.status === "failed" ? (
                            <XCircle className="text-danger" />
                          ) : (
                            <Circle className="text-subtle" />
                          )}
                        </span>
                      </span>
                      {!last && (
                        <span className="flex flex-1 flex-col items-center py-1" aria-hidden>
                          <span className={cn("w-px flex-1", step.status === "success" ? "bg-border-strong" : "border-l border-dashed border-border-strong")} />
                          <ArrowDown className={cn("size-3", step.status === "success" ? "text-border-strong" : "text-border")} />
                        </span>
                      )}
                    </div>

                    <div className={cn("min-w-0 flex-1", !last && "pb-5")}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                        <p className={cn("text-sm font-semibold", step.status === "skipped" ? "text-muted" : "text-ink")}>{step.label}</p>
                        {step.at !== null ? (
                          <time dateTime={new Date(step.at).toISOString()} className="font-mono text-xs tabular-nums text-muted">
                            {clock.format(step.at)}
                          </time>
                        ) : (
                          <span className="text-xs text-subtle">Skipped</span>
                        )}
                      </div>
                      <p className={cn("mt-0.5 text-sm", step.status === "skipped" ? "text-subtle" : "text-muted")}>{step.detail}</p>
                      {step.status !== "skipped" && (
                        <p className="mt-1 font-mono text-2xs tabular-nums text-subtle">
                          {offset === 0 ? "Start" : `+${formatDuration(offset ?? 0)}`} · took {formatDuration(step.durationMs)}
                        </p>
                      )}
                      {step.error && (
                        <p className="mt-2 flex items-start gap-2 rounded-md bg-danger-soft px-3 py-2 text-xs text-danger-text">
                          <AlertCircle className="mt-px size-3.5 shrink-0" />
                          {step.error}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      )}
    </Drawer>
  );
}
