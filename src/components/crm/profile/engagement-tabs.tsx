import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ListTodo, MessageSquareText, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { ownerById, ownerIdFor, owners } from "@/lib/crm/constants";
import { useCrm } from "@/lib/crm/crm-context";
import { dueFromOption, dueLabel, dueOptions } from "@/lib/crm/insights";
import type { Activity, ActivityType, Lead, Note, Task } from "@/lib/crm/types";
import { formatRelative } from "@/lib/format";
import { Avatar, Button, Checkbox, EmptyState, Input, Tabs, Textarea, useToast } from "@/components/ui";
import { ActivityFeed } from "./activity-feed";

const selectClass =
  "h-8 cursor-pointer rounded-md border border-border bg-white px-2 text-sm text-ink outline-none transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:shadow-focus";

/* Activity ---------------------------------------------------------------- */

const activityFilters: { value: string; label: string; types: ActivityType[] }[] = [
  { value: "all", label: "All", types: [] },
  { value: "email", label: "Emails", types: ["email"] },
  { value: "call", label: "Calls", types: ["call"] },
  { value: "meeting", label: "Meetings", types: ["meeting"] },
  { value: "notes", label: "Notes & tasks", types: ["note", "task"] },
  { value: "updates", label: "Updates", types: ["status", "deal", "web", "form"] },
];

const loggable: { value: ActivityType; label: string; placeholder: string }[] = [
  { value: "call", label: "Call", placeholder: "Discussed pricing tiers and rollout timeline" },
  { value: "email", label: "Email", placeholder: "Sent recap and next steps" },
  { value: "meeting", label: "Meeting", placeholder: "Demo with the ops team" },
];

export function ActivityTab({ lead, timeline, now }: { lead: Lead; timeline: Activity[]; now: number }) {
  const { actions } = useCrm();
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [type, setType] = useState<ActivityType>("call");
  const [summary, setSummary] = useState("");
  const types = activityFilters.find((f) => f.value === filter)?.types ?? [];
  const items = types.length === 0 ? timeline : timeline.filter((a) => types.includes(a.type));
  const typeMeta = loggable.find((l) => l.value === type)!;

  function log(event: FormEvent) {
    event.preventDefault();
    if (!summary.trim()) return;
    const title = `${typeMeta.label} logged`;
    actions.logActivity(lead.id, type, title, summary.trim());
    setSummary("");
    setFilter("all");
    toast({ variant: "success", title });
  }

  return (
    <div className="space-y-5">
      <form onSubmit={log} className="flex flex-col gap-2 rounded-lg border border-border bg-canvas p-3 sm:flex-row">
        <select aria-label="Activity type" value={type} onChange={(e) => setType(e.target.value as ActivityType)} className={selectClass}>
          {loggable.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <Input
          size="sm"
          aria-label="Activity summary"
          placeholder={typeMeta.placeholder}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          containerClassName="flex-1"
        />
        <Button type="submit" size="sm" disabled={!summary.trim()}>
          Log activity
        </Button>
      </form>

      <div className="scrollbar-none -mx-1 overflow-x-auto px-1">
        <Tabs variant="segmented" value={filter} onValueChange={setFilter} items={activityFilters.map(({ value, label }) => ({ value, label }))} />
      </div>

      {items.length === 0 ? (
        <EmptyState size="sm" bordered title="Nothing here yet" description="Activity of this type will show up as it happens." />
      ) : (
        <ActivityFeed items={items} now={now} />
      )}
    </div>
  );
}

/* Notes ------------------------------------------------------------------- */

export function NotesTab({ lead, notes, now }: { lead: Lead; notes: Note[]; now: number }) {
  const { actions, actor } = useCrm();
  const { toast } = useToast();
  const [body, setBody] = useState("");

  function save(event?: FormEvent) {
    event?.preventDefault();
    if (!body.trim()) return;
    actions.addNote(lead.id, body.trim());
    setBody("");
    toast({ variant: "success", title: "Note saved" });
  }

  return (
    <div className="space-y-5">
      <form onSubmit={save} className="rounded-lg border border-border p-3 focus-within:border-primary focus-within:shadow-focus">
        <Textarea
          aria-label="New note"
          rows={3}
          placeholder={`Add a note about ${lead.name.split(" ")[0]}…`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
          }}
          className="resize-none border-0 p-0 shadow-none focus-visible:border-0 focus-visible:shadow-none"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-xs text-muted">
            <Avatar name={actor} size="xs" />
            <span className="hidden sm:inline">Ctrl + Enter to save</span>
          </span>
          <Button type="submit" size="sm" disabled={!body.trim()}>
            Save note
          </Button>
        </div>
      </form>

      {notes.length === 0 ? (
        <EmptyState
          size="sm"
          bordered
          icon={<MessageSquareText />}
          title="No notes yet"
          description="Capture context from calls and meetings so your whole team stays in the loop."
        />
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {notes.map((note) => (
              <motion.li
                key={note.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="glass-card group overflow-hidden rounded-xl p-4"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar name={note.author} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{note.author}</p>
                    <p className="font-mono text-2xs tabular-nums text-subtle" title={new Date(note.createdAt).toLocaleString()}>
                      {formatRelative(note.createdAt, now)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Delete note"
                    className="text-subtle opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                    onClick={() => {
                      actions.deleteNote(note.id);
                      toast({ title: "Note deleted" });
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">{note.body}</p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

/* Tasks ------------------------------------------------------------------- */

function TaskRow({ task, now }: { task: Task; now: number }) {
  const { actions } = useCrm();
  const due = dueLabel(task.dueAt, now);
  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group flex items-start gap-3 px-3 py-2.5"
    >
      <Checkbox className="mt-0.5" checked={task.done} onChange={() => actions.toggleTask(task.id)} aria-label={`Mark "${task.title}" ${task.done ? "not done" : "done"}`} />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm text-ink", task.done && "text-muted line-through")}>{task.title}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
          <span
            className={cn(
              "font-mono tabular-nums",
              !task.done && due.tone === "danger" && "text-danger-text",
              !task.done && due.tone === "warning" && "text-warning-text",
            )}
          >
            {task.done ? "Done" : due.text}
          </span>
          <span aria-hidden>·</span>
          <span>{ownerById(task.ownerId).name}</span>
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Delete task"
        className="text-subtle sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        onClick={() => actions.deleteTask(task.id)}
      >
        <Trash2 />
      </Button>
    </motion.li>
  );
}

export function TasksTab({ lead, tasks, now }: { lead: Lead; tasks: Task[]; now: number }) {
  const { actions, actor } = useCrm();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("tomorrow");
  const [ownerId, setOwnerId] = useState(() => ownerIdFor(actor));
  const [showDone, setShowDone] = useState(false);
  const open = tasks.filter((t) => !t.done).sort((a, b) => a.dueAt - b.dueAt);
  const done = tasks.filter((t) => t.done);

  function add(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    actions.addTask(lead.id, title.trim(), dueFromOption(due), ownerId);
    setTitle("");
    toast({ variant: "success", title: "Task added" });
  }

  return (
    <div className="space-y-5">
      <form onSubmit={add} className="flex flex-col gap-2 rounded-lg border border-border bg-canvas p-3 sm:flex-row sm:flex-wrap lg:flex-nowrap">
        <Input
          size="sm"
          aria-label="Task"
          placeholder="Send pricing follow-up"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          containerClassName="flex-1 sm:min-w-56"
        />
        <div className="flex gap-2">
          <select aria-label="Due" value={due} onChange={(e) => setDue(e.target.value)} className={cn(selectClass, "flex-1")}>
            {dueOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select aria-label="Assignee" value={ownerId} onChange={(e) => setOwnerId(e.target.value)} className={cn(selectClass, "flex-1")}>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" leftIcon={<Plus />} disabled={!title.trim()}>
            Add
          </Button>
        </div>
      </form>

      {open.length === 0 && done.length === 0 ? (
        <EmptyState size="sm" bordered icon={<ListTodo />} title="No tasks yet" description="Add a follow-up so nothing slips through the cracks." />
      ) : (
        <>
          {open.length === 0 ? (
            <p className="rounded-md border border-dashed border-border-strong bg-canvas px-3 py-4 text-center text-sm text-muted">
              All caught up. No open tasks.
            </p>
          ) : (
            <ul className="divide-y divide-border-subtle rounded-lg border border-border">
              <AnimatePresence initial={false}>
                {open.map((task) => (
                  <TaskRow key={task.id} task={task} now={now} />
                ))}
              </AnimatePresence>
            </ul>
          )}
          {done.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowDone((v) => !v)}
                aria-expanded={showDone}
                className="flex items-center gap-1.5 rounded-xs text-sm font-medium text-muted outline-none hover:text-ink focus-visible:shadow-focus"
              >
                <ChevronDown className={cn("size-4 transition-transform", !showDone && "-rotate-90")} aria-hidden />
                Completed ({done.length})
              </button>
              {showDone && (
                <ul className="mt-2 divide-y divide-border-subtle rounded-lg border border-border bg-canvas/50">
                  <AnimatePresence initial={false}>
                    {done.map((task) => (
                      <TaskRow key={task.id} task={task} now={now} />
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
