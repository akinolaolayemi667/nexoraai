import { cn } from "@/lib/cn";
import { Avatar, Badge, Card, Checkbox } from "@/components/ui";
import type { PreviewTask } from "./preview-data";

export function PreviewTasks({
  tasks,
  onToggle,
}: {
  tasks: PreviewTask[];
  onToggle: (id: string) => void;
}) {
  const open = tasks.filter((task) => !task.done).length;

  return (
    <Card padding="none" className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pt-4">
        <p className="text-sm font-semibold text-ink">My tasks</p>
        <span className="text-2xs text-muted">
          <span className="text-metric text-ink">{open}</span> of {tasks.length} left
        </span>
      </div>
      <ul className="mt-2 flex flex-col px-2 pb-2">
        {tasks.map((task) => (
          <li key={task.id}>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-canvas">
              <Checkbox checked={task.done} onChange={() => onToggle(task.id)} className="mt-0.5 size-3.5" />
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate text-xs transition-colors",
                    task.done ? "text-subtle line-through" : "text-ink",
                  )}
                >
                  {task.title}
                </span>
                <span className="mt-1 flex items-center gap-1.5">
                  <span
                    className={cn(
                      "text-2xs",
                      task.due === "Today" && !task.done ? "font-medium text-warning-text" : "text-subtle",
                    )}
                  >
                    {task.due}
                  </span>
                  {task.ai && (
                    <Badge variant="accent" size="sm" className="px-1 py-0 text-[0.625rem]">
                      AI
                    </Badge>
                  )}
                </span>
              </span>
              <Avatar name={task.owner} size="xs" />
            </label>
          </li>
        ))}
      </ul>
    </Card>
  );
}
