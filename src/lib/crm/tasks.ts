import type { Task, TaskPriority, TaskStatus } from "./types";

const DAY = 86_400_000;

export type TaskView = "today" | "upcoming" | "completed";

export const priorityMeta: Record<TaskPriority, { label: string; rank: number; variant: "danger" | "warning" | "neutral" }> = {
  high: { label: "High", rank: 0, variant: "danger" },
  medium: { label: "Medium", rank: 1, variant: "warning" },
  low: { label: "Low", rank: 2, variant: "neutral" },
};

export const statusMeta: Record<TaskStatus, { label: string; variant: "neutral" | "primary" | "success" }> = {
  todo: { label: "To do", variant: "neutral" },
  in_progress: { label: "In progress", variant: "primary" },
  done: { label: "Completed", variant: "success" },
};

export const taskPriority = (task: Task): TaskPriority => task.priority ?? "medium";

export const taskStatus = (task: Task): TaskStatus => (task.done ? "done" : task.status === "in_progress" ? "in_progress" : "todo");

export function endOfDay(now: number) {
  const d = new Date(now);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function taskView(task: Task, now: number): TaskView {
  if (task.done) return "completed";
  return task.dueAt <= endOfDay(now) ? "today" : "upcoming";
}

const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const longDay = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });

function dayDiff(timestamp: number, now: number) {
  const a = new Date(timestamp);
  const b = new Date(now);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((a.getTime() - b.getTime()) / DAY);
}

/** Section heading for a task within its view. */
export function taskGroup(task: Task, view: TaskView, now: number) {
  if (view === "today") return task.dueAt < now ? "Overdue" : "Due today";
  const ts = view === "completed" ? (task.completedAt ?? task.dueAt) : task.dueAt;
  const diff = dayDiff(ts, now);
  if (view === "completed") {
    if (diff === 0) return "Today";
    if (diff === -1) return "Yesterday";
    if (diff > -7) return "Earlier this week";
    return "Older";
  }
  if (diff === 1) return "Tomorrow";
  if (diff < 7) return weekday.format(ts);
  if (diff < 14) return "Next week";
  return "Later";
}

export function sortTasks(tasks: Task[], view: TaskView) {
  return [...tasks].sort((a, b) => {
    if (view === "completed") return (b.completedAt ?? b.dueAt) - (a.completedAt ?? a.dueAt);
    return a.dueAt - b.dueAt || priorityMeta[taskPriority(a)].rank - priorityMeta[taskPriority(b)].rank;
  });
}

export function formatDue(task: Task, now: number) {
  const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(task.dueAt);
  const diff = dayDiff(task.dueAt, now);
  if (diff === 0) return `Today, ${time}`;
  if (diff === 1) return `Tomorrow, ${time}`;
  if (diff === -1) return `Yesterday, ${time}`;
  return longDay.format(task.dueAt);
}

export function toDateInput(ts: number) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toTimeInput(ts: number) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function fromInputs(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = (time || "09:00").split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, h || 0, min || 0).getTime();
}
