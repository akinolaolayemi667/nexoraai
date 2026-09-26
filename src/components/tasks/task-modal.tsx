import { useMemo, useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { owners } from "@/lib/crm/constants";
import { fromInputs, priorityMeta, statusMeta, taskPriority, taskStatus, toDateInput, toTimeInput } from "@/lib/crm/tasks";
import type { Lead, Task, TaskPriority, TaskStatus } from "@/lib/crm/types";
import { Button, Input, Modal, Select } from "@/components/ui";

export type TaskDraft = {
  title: string;
  dueAt: number;
  priority: TaskPriority;
  ownerId: string;
  leadId: string;
  status: TaskStatus;
};

type TaskModalProps = {
  open: boolean;
  task: Task | null;
  leads: Lead[];
  defaultOwnerId: string;
  defaultDueAt: number;
  onClose: () => void;
  onSave: (draft: TaskDraft) => void;
  onDelete?: (task: Task) => void;
};

const priorities: TaskPriority[] = ["high", "medium", "low"];
const priorityDot: Record<TaskPriority, string> = { high: "bg-danger", medium: "bg-warning", low: "bg-subtle" };

export function TaskModal(props: TaskModalProps) {
  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      title={props.task ? "Edit task" : "New task"}
      description={props.task ? "Changes are saved to the related lead's timeline." : "Tasks appear on the related lead's profile too."}
      size="md"
    >
      {props.open && <TaskForm key={props.task?.id ?? "new"} {...props} />}
    </Modal>
  );
}

function TaskForm({ task, leads, defaultOwnerId, defaultDueAt, onClose, onSave, onDelete }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [date, setDate] = useState(toDateInput(task?.dueAt ?? defaultDueAt));
  const [time, setTime] = useState(toTimeInput(task?.dueAt ?? defaultDueAt));
  const [priority, setPriority] = useState<TaskPriority>(task ? taskPriority(task) : "medium");
  const [ownerId, setOwnerId] = useState(task?.ownerId ?? defaultOwnerId);
  const [leadId, setLeadId] = useState(task?.leadId ?? "");
  const [status, setStatus] = useState<TaskStatus>(task ? taskStatus(task) : "todo");
  const [submitted, setSubmitted] = useState(false);

  const leadOptions = useMemo(
    () =>
      [...leads]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((l) => ({ value: l.id, label: `${l.name} · ${l.company}` })),
    [leads],
  );

  const errors = {
    title: !title.trim() ? "Give the task a name." : title.trim().length > 120 ? "Keep it under 120 characters." : undefined,
    date: !date ? "Choose a due date." : undefined,
    lead: !leadId ? "Choose the lead this task is for." : undefined,
  };
  const valid = !errors.title && !errors.date && !errors.lead;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!valid) return;
    onSave({ title: title.trim(), dueAt: fromInputs(date, time), priority, ownerId, leadId, status });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Input
        label="Task"
        value={title}
        autoFocus
        placeholder="e.g. Send revised proposal"
        onChange={(e) => setTitle(e.target.value)}
        error={submitted ? errors.title : undefined}
        maxLength={140}
      />
      <div className="grid grid-cols-[1fr_8rem] gap-3">
        <Input type="date" label="Due date" value={date} onChange={(e) => setDate(e.target.value)} error={submitted ? errors.date : undefined} />
        <Input type="time" label="Time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink">Priority</legend>
        <div className="grid grid-cols-3 gap-2" role="radiogroup">
          {priorities.map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={priority === p}
              onClick={() => setPriority(p)}
              className={cn(
                "flex h-9 items-center justify-center gap-2 rounded-md border text-sm font-medium outline-none transition-colors focus-visible:shadow-focus",
                priority === p ? "border-primary bg-primary-soft/40 text-ink" : "border-border text-muted hover:border-border-strong hover:text-ink",
              )}
            >
              <span className={cn("size-2 rounded-full", priorityDot[p])} aria-hidden />
              {priorityMeta[p].label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <Select label="Owner" value={ownerId} onChange={(e) => setOwnerId(e.target.value)} options={owners.map((o) => ({ value: o.id, label: o.name }))} />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
          options={(Object.keys(statusMeta) as TaskStatus[]).map((s) => ({ value: s, label: statusMeta[s].label }))}
        />
      </div>
      <Select
        label="Related lead"
        value={leadId}
        placeholder="Choose a lead"
        onChange={(e) => setLeadId(e.target.value)}
        options={leadOptions}
        error={submitted ? errors.lead : undefined}
      />

      <div className="sticky -bottom-5 -mx-6 -mb-5 mt-2 flex items-center gap-2 border-t border-border bg-canvas px-6 py-3">
        {task && onDelete && (
          <Button type="button" variant="ghost" size="sm" leftIcon={<Trash2 />} className="-ml-2 text-danger-text hover:bg-danger-soft" onClick={() => onDelete(task)}>
            Delete
          </Button>
        )}
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            {task ? "Save changes" : "Create task"}
          </Button>
        </div>
      </div>
    </form>
  );
}
