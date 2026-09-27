import { useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock,
  ListChecks,
  MoreHorizontal,
  PencilLine,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ownerById, ownerIdFor, owners } from "@/lib/crm/constants";
import { useCrm } from "@/lib/crm/crm-context";
import {
  endOfDay,
  formatDue,
  priorityMeta,
  sortTasks,
  statusMeta,
  taskGroup,
  taskPriority,
  taskStatus,
  taskView,
  type TaskView,
} from "@/lib/crm/tasks";
import type { Lead, Task, TaskPriority, TaskStatus } from "@/lib/crm/types";
import { routes } from "@/lib/routes";
import { useNow } from "@/hooks/use-now";
import { Avatar, Badge, Button, ConfirmDialog, Dropdown, EmptyState, Input, Select, Tabs, useToast } from "@/components/ui";
import { TaskModal, type TaskDraft } from "@/components/tasks/task-modal";

const views: TaskView[] = ["today", "upcoming", "completed"];
const viewLabel: Record<TaskView, string> = { today: "Today", upcoming: "Upcoming", completed: "Completed" };
const cols = "lg:grid-cols-[1.75rem_minmax(0,1fr)_8.5rem_6rem_9rem_minmax(0,12rem)_8rem_2rem]";
const DAY = 86_400_000;

function StatTile({ label, value, icon, tone, onClick, active }: { label: string; value: number; icon: ReactNode; tone: string; onClick?: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-white p-3 text-left shadow-xs outline-none transition-colors focus-visible:shadow-focus sm:p-4",
        active ? "border-primary-border ring-1 ring-primary-border" : "border-border hover:border-border-strong",
      )}
    >
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md [&_svg]:size-4", tone)}>{icon}</span>
      <span className="min-w-0">
        <span className="block font-mono text-lg font-semibold tabular-nums leading-tight text-ink">{value}</span>
        <span className="block truncate text-xs text-muted">{label}</span>
      </span>
    </button>
  );
}

function CompleteButton({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={task.done}
      aria-label={task.done ? `Mark “${task.title}” as not done` : `Complete “${task.title}”`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "group/check flex size-5 shrink-0 items-center justify-center rounded-full border outline-none transition-colors focus-visible:shadow-focus",
        task.done ? "border-success bg-success text-white" : "border-border-strong bg-white text-transparent hover:border-success hover:text-success",
      )}
    >
      <Check className="size-3" strokeWidth={3} aria-hidden />
    </button>
  );
}

function StatusMenu({ task, onChange }: { task: Task; onChange: (status: TaskStatus) => void }) {
  const status = taskStatus(task);
  return (
    <Dropdown
      align="end"
      width="w-44"
      trigger={({ open, onClick, ...props }) => (
        <button
          type="button"
          {...props}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={cn("rounded-sm outline-none focus-visible:shadow-focus", open && "ring-2 ring-primary-border")}
          aria-label={`Status: ${statusMeta[status].label}. Change status`}
        >
          <Badge variant={statusMeta[status].variant} dot className="cursor-pointer pr-1">
            {statusMeta[status].label}
            <ChevronDown className="opacity-60" />
          </Badge>
        </button>
      )}
      items={(Object.keys(statusMeta) as TaskStatus[]).map((s) => ({
        label: statusMeta[s].label,
        selected: s === status,
        onSelect: () => s !== status && onChange(s),
      }))}
      selectable
    />
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const meta = priorityMeta[priority];
  return (
    <Badge variant={meta.variant} dot>
      {meta.label}
    </Badge>
  );
}

type RowProps = {
  task: Task;
  lead: Lead | undefined;
  now: number;
  onOpen: () => void;
  onToggle: () => void;
  onStatus: (status: TaskStatus) => void;
  onDelete: () => void;
};

function TaskRow({ task, lead, now, onOpen, onToggle, onStatus, onDelete }: RowProps) {
  const owner = ownerById(task.ownerId);
  const overdue = !task.done && task.dueAt < now;
  const dueText = task.done ? formatDue({ ...task, dueAt: task.completedAt ?? task.dueAt }, now) : formatDue(task, now);
  const priority = taskPriority(task);

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18 }}
      className="border-t border-border-subtle first:border-t-0"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onOpen();
          }
        }}
        className={cn(
          "grid cursor-pointer grid-cols-[1.75rem_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 px-4 py-3 outline-none transition-colors hover:bg-canvas focus-visible:bg-canvas focus-visible:shadow-[inset_0_0_0_2px_var(--color-primary)] lg:items-center lg:py-2.5",
          cols,
        )}
      >
        <span className="pt-0.5 lg:pt-0">
          <CompleteButton task={task} onToggle={onToggle} />
        </span>

        <div className="min-w-0">
          <p className={cn("truncate text-sm font-medium", task.done ? "text-muted line-through decoration-border-strong" : "text-ink")}>{task.title}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted lg:hidden">
            <span className={cn("inline-flex items-center gap-1 font-mono tabular-nums", overdue && "text-danger-text")}>
              <Clock className="size-3" aria-hidden />
              {dueText}
            </span>
            <PriorityBadge priority={priority} />
            {lead && <span className="truncate">{lead.name}</span>}
          </p>
        </div>

        <span className={cn("hidden font-mono text-xs tabular-nums lg:block", overdue ? "font-medium text-danger-text" : task.done ? "text-subtle" : "text-muted")}>
          {overdue && <span className="sr-only">Overdue: </span>}
          {dueText}
        </span>

        <span className="hidden lg:block">
          <PriorityBadge priority={priority} />
        </span>

        <span className="hidden min-w-0 items-center gap-2 lg:flex">
          <Avatar name={owner.name} size="xs" />
          <span className="truncate text-sm text-ink">{owner.name}</span>
        </span>

        <span className="hidden min-w-0 lg:block">
          {lead ? (
            <Link
              to={routes.app.lead(lead.id)}
              onClick={(e) => e.stopPropagation()}
              className="block min-w-0 rounded-xs outline-none hover:underline focus-visible:shadow-focus"
            >
              <span className="block truncate text-sm text-ink">{lead.name}</span>
              <span className="block truncate text-xs text-subtle">{lead.company}</span>
            </Link>
          ) : (
            <span className="text-sm text-subtle">—</span>
          )}
        </span>

        <span className="flex justify-end lg:justify-start">
          <StatusMenu task={task} onChange={onStatus} />
        </span>

        <span className="hidden lg:block">
          <Dropdown
            align="end"
            width="w-44"
            trigger={({ open, onClick, ...props }) => (
              <Button
                {...props}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                variant="ghost"
                size="icon-xs"
                aria-label={`More actions for ${task.title}`}
                className={cn(open && "bg-sunken")}
              >
                <MoreHorizontal />
              </Button>
            )}
            items={[
              { label: "Edit task", icon: <PencilLine />, onSelect: onOpen },
              { label: task.done ? "Mark as not done" : "Mark complete", icon: <CheckCircle2 />, onSelect: onToggle },
              { type: "separator" },
              { label: "Delete", icon: <Trash2 />, danger: true, onSelect: onDelete },
            ]}
          />
        </span>
      </div>
    </motion.li>
  );
}

export default function TasksPage() {
  const { state, actions, actor } = useCrm();
  const { toast } = useToast();
  const now = useNow(30_000);
  const myId = ownerIdFor(actor);
  const [params, setParams] = useSearchParams();
  const rawView = params.get("view") as TaskView | null;
  const view: TaskView = rawView && views.includes(rawView) ? rawView : "today";
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState("all");
  const [priority, setPriority] = useState<"all" | TaskPriority>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "overdue" | "in_progress">("all");
  const [editing, setEditing] = useState<{ task: Task | null } | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  const leadMap = useMemo(() => new Map(state.leads.map((l) => [l.id, l])), [state.leads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.tasks.filter((t) => {
      if (owner !== "all" && t.ownerId !== owner) return false;
      if (priority !== "all" && taskPriority(t) !== priority) return false;
      if (statusFilter === "overdue" && (t.done || t.dueAt >= now)) return false;
      if (statusFilter === "in_progress" && taskStatus(t) !== "in_progress") return false;
      if (!q) return true;
      const lead = leadMap.get(t.leadId);
      return [t.title, lead?.name, lead?.company, ownerById(t.ownerId).name].some((v) => v?.toLowerCase().includes(q));
    });
  }, [state.tasks, owner, priority, statusFilter, query, leadMap, now]);

  const counts = useMemo(() => {
    const c: Record<TaskView, number> = { today: 0, upcoming: 0, completed: 0 };
    filtered.forEach((t) => (c[taskView(t, now)] += 1));
    return c;
  }, [filtered, now]);

  const groups = useMemo(() => {
    const rows = sortTasks(filtered.filter((t) => taskView(t, now) === view), view);
    const map = new Map<string, Task[]>();
    rows.forEach((t) => {
      const label = taskGroup(t, view, now);
      map.set(label, [...(map.get(label) ?? []), t]);
    });
    return [...map.entries()];
  }, [filtered, view, now]);

  const stats = useMemo(() => {
    const open = state.tasks.filter((t) => !t.done);
    const weekAgo = now - 7 * DAY;
    return {
      dueToday: open.filter((t) => t.dueAt >= now && t.dueAt <= endOfDay(now)).length,
      overdue: open.filter((t) => t.dueAt < now).length,
      inProgress: open.filter((t) => taskStatus(t) === "in_progress").length,
      completedWeek: state.tasks.filter((t) => t.done && (t.completedAt ?? 0) >= weekAgo).length,
    };
  }, [state.tasks, now]);

  const setView = (next: TaskView) => {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (next === "today") p.delete("view");
        else p.set("view", next);
        return p;
      },
      { replace: true },
    );
  };

  const changeStatus = (task: Task, status: TaskStatus) => {
    const previous = taskStatus(task);
    actions.updateTask(task.id, { status });
    if (status === "done") {
      toast({
        variant: "success",
        title: "Task completed",
        description: task.title,
        action: { label: "Undo", onClick: () => actions.updateTask(task.id, { status: previous }) },
      });
    }
  };

  const toggle = (task: Task) => changeStatus(task, task.done ? "todo" : "done");

  const save = (draft: TaskDraft) => {
    const task = editing?.task;
    if (task) {
      actions.updateTask(task.id, draft);
      toast({ variant: "success", title: "Task updated", description: draft.title });
    } else {
      actions.addTask(draft.leadId, draft.title, draft.dueAt, draft.ownerId, {
        priority: draft.priority,
        status: draft.status === "done" ? "todo" : draft.status,
      });
      const target = draft.status === "done" ? "completed" : draft.dueAt <= endOfDay(Date.now()) ? "today" : "upcoming";
      toast({
        variant: "success",
        title: "Task created",
        description: `${draft.title} · ${viewLabel[target]}`,
        action: target !== view ? { label: `View ${viewLabel[target].toLowerCase()}`, onClick: () => setView(target) } : undefined,
      });
    }
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    actions.deleteTask(deleting.id);
    toast({ variant: "info", title: "Task deleted", description: deleting.title });
    setDeleting(null);
    setEditing(null);
  };

  const hasFilters = query || owner !== "all" || priority !== "all" || statusFilter !== "all";
  const clearFilters = () => {
    setQuery("");
    setOwner("all");
    setPriority("all");
    setStatusFilter("all");
  };

  const defaultDue = (() => {
    const d = new Date(now);
    if (view === "upcoming") {
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
      return d.getTime();
    }
    d.setHours(17, 0, 0, 0);
    return d.getTime() > now ? d.getTime() : now + 3_600_000;
  })();

  const empty = {
    today: { title: "You're all caught up", description: "Nothing is due today. Enjoy the breathing room or plan ahead." },
    upcoming: { title: "Nothing scheduled", description: "Upcoming tasks for your leads will appear here." },
    completed: { title: "No completed tasks yet", description: "Tasks you finish will be listed here." },
  }[view];

  return (
    <>
      <title>Tasks · NEXORA AI</title>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Tasks</h1>
          <p className="mt-1 text-base text-muted">Every follow-up, call and to-do across your leads.</p>
        </div>
        <Button size="sm" leftIcon={<Plus />} onClick={() => setEditing({ task: null })} className="self-start sm:self-auto">
          New task
        </Button>
      </header>

      <section aria-label="Task summary" className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Due today"
          value={stats.dueToday}
          icon={<CalendarClock />}
          tone="bg-warning-soft text-warning-text"
          onClick={() => {
            setStatusFilter("all");
            setView("today");
          }}
        />
        <StatTile
          label="Overdue"
          value={stats.overdue}
          icon={<AlertCircle />}
          tone="bg-danger-soft text-danger-text"
          active={statusFilter === "overdue"}
          onClick={() => {
            setStatusFilter(statusFilter === "overdue" ? "all" : "overdue");
            setView("today");
          }}
        />
        <StatTile
          label="In progress"
          value={stats.inProgress}
          icon={<CircleDot />}
          tone="bg-primary-soft text-primary-active"
          active={statusFilter === "in_progress"}
          onClick={() => setStatusFilter(statusFilter === "in_progress" ? "all" : "in_progress")}
        />
        <StatTile
          label="Completed this week"
          value={stats.completedWeek}
          icon={<CheckCircle2 />}
          tone="bg-success-soft text-success-text"
          onClick={() => {
            setStatusFilter("all");
            setView("completed");
          }}
        />
      </section>

      <div className="glass-card mt-4 overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="scrollbar-none -mx-1 overflow-x-auto px-1">
            <Tabs
              variant="segmented"
              value={view}
              onValueChange={(v) => setView(v as TaskView)}
              items={views.map((v) => ({ value: v, label: viewLabel[v], count: counts[v] }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Input
              size="sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks or leads"
              leftIcon={<Search />}
              aria-label="Search tasks"
              containerClassName="col-span-2 sm:w-56"
            />
            <Select
              size="sm"
              aria-label="Owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              options={[
                { value: "all", label: "All owners" },
                { value: myId, label: "My tasks" },
                ...owners.filter((o) => o.id !== myId).map((o) => ({ value: o.id, label: o.name })),
              ]}
              containerClassName="sm:w-36"
            />
            <Select
              size="sm"
              aria-label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as "all" | TaskPriority)}
              options={[
                { value: "all", label: "Any priority" },
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
              containerClassName="sm:w-32"
            />
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between gap-3 border-b border-border bg-canvas px-4 py-2 text-xs text-muted">
            <span>
              {statusFilter === "overdue" ? "Showing overdue tasks" : statusFilter === "in_progress" ? "Showing tasks in progress" : "Filters applied"} ·{" "}
              {counts[view]} in {viewLabel[view].toLowerCase()}
            </span>
            <button type="button" onClick={clearFilters} className="font-medium text-primary hover:underline">
              Clear filters
            </button>
          </div>
        )}

        <div
          className={cn(
            "hidden border-b border-border bg-canvas px-4 py-2 text-2xs font-medium uppercase tracking-wider text-subtle lg:grid lg:gap-x-3",
            cols,
          )}
        >
          <span />
          <span>Task</span>
          <span>{view === "completed" ? "Completed" : "Due date"}</span>
          <span>Priority</span>
          <span>Owner</span>
          <span>Related lead</span>
          <span>Status</span>
          <span />
        </div>

        {groups.length === 0 ? (
          <EmptyState
            size="sm"
            icon={hasFilters ? <Search /> : <ListChecks />}
            title={hasFilters ? "No tasks match these filters" : empty.title}
            description={hasFilters ? "Try another search or clear the filters." : empty.description}
            action={
              hasFilters ? (
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : view !== "completed" ? (
                <Button variant="secondary" size="sm" leftIcon={<Plus />} onClick={() => setEditing({ task: null })}>
                  New task
                </Button>
              ) : undefined
            }
            className="py-14"
          />
        ) : (
          groups.map(([label, items]) => (
            <section key={label} aria-label={label}>
              <h2
                className={cn(
                  "flex items-center gap-2 border-b border-border-subtle bg-white px-4 pb-1.5 pt-4 text-xs font-semibold",
                  label === "Overdue" ? "text-danger-text" : "text-ink",
                )}
              >
                {label}
                <span className="rounded-sm bg-sunken px-1.5 font-mono text-2xs font-medium tabular-nums text-muted">{items.length}</span>
              </h2>
              <ul>
                <AnimatePresence initial={false}>
                  {items.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      lead={leadMap.get(task.leadId)}
                      now={now}
                      onOpen={() => setEditing({ task })}
                      onToggle={() => toggle(task)}
                      onStatus={(s) => changeStatus(task, s)}
                      onDelete={() => setDeleting(task)}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          ))
        )}
      </div>

      <TaskModal
        open={editing !== null}
        task={editing?.task ?? null}
        leads={state.leads}
        defaultOwnerId={myId}
        defaultDueAt={defaultDue}
        onClose={() => setEditing(null)}
        onSave={save}
        onDelete={(task) => setDeleting(task)}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        tone="danger"
        title="Delete this task?"
        description={deleting ? `“${deleting.title}” will be removed for everyone. This can't be undone.` : undefined}
        confirmLabel="Delete task"
      />
    </>
  );
}
