import {
  ArrowRightLeft,
  CalendarDays,
  CircleCheck,
  FileText,
  Globe,
  Handshake,
  Mail,
  Phone,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { dayGroupLabel } from "@/lib/crm/insights";
import type { Activity, ActivityType } from "@/lib/crm/types";
import { formatRelative, formatTime } from "@/lib/format";

export const activityStyles: Record<ActivityType, { icon: LucideIcon; className: string; label: string }> = {
  email: { icon: Mail, className: "bg-sky-50 text-sky-700 ring-sky-200", label: "Email" },
  call: { icon: Phone, className: "bg-success-soft text-success-text ring-success-border", label: "Call" },
  meeting: { icon: CalendarDays, className: "bg-accent-soft text-accent ring-accent-border", label: "Meeting" },
  note: { icon: StickyNote, className: "bg-warning-soft text-warning-text ring-warning-border", label: "Note" },
  task: { icon: CircleCheck, className: "bg-primary-soft/60 text-primary-active ring-primary-border", label: "Task" },
  status: { icon: ArrowRightLeft, className: "bg-sunken text-muted ring-border", label: "Update" },
  deal: { icon: Handshake, className: "bg-success-soft text-success-text ring-success-border", label: "Deal" },
  web: { icon: Globe, className: "bg-sunken text-muted ring-border", label: "Website" },
  form: { icon: FileText, className: "bg-primary-soft/60 text-primary-active ring-primary-border", label: "Form" },
};

function Item({ activity, now, last }: { activity: Activity; now: number; last: boolean }) {
  const style = activityStyles[activity.type];
  const Icon = style.icon;
  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {!last && <span className="absolute bottom-0 left-3.5 top-8 w-px bg-border" aria-hidden />}
      <span className={cn("relative flex size-7 shrink-0 items-center justify-center rounded-full ring-1 ring-inset", style.className)}>
        <Icon className="size-3.5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p className="text-sm font-medium text-ink">{activity.title}</p>
          <time
            dateTime={new Date(activity.at).toISOString()}
            title={new Date(activity.at).toLocaleString()}
            className="shrink-0 font-mono text-2xs tabular-nums text-subtle"
          >
            {now - activity.at < 24 * 3600_000 ? formatRelative(activity.at, now) : formatTime(activity.at)}
          </time>
        </div>
        {activity.detail && (
          <p
            className={cn(
              "mt-0.5 text-sm text-muted",
              activity.type === "note" && "mt-1.5 whitespace-pre-wrap rounded-md border border-border-subtle bg-canvas px-3 py-2 text-ink",
            )}
          >
            {activity.detail}
          </p>
        )}
        {activity.actor && <p className="mt-0.5 text-xs text-subtle">by {activity.actor}</p>}
      </div>
    </li>
  );
}

export function ActivityFeed({ items, now, grouped = true }: { items: Activity[]; now: number; grouped?: boolean }) {
  if (!grouped) {
    return (
      <ol>
        {items.map((activity, i) => (
          <Item key={activity.id} activity={activity} now={now} last={i === items.length - 1} />
        ))}
      </ol>
    );
  }

  const groups: { label: string; items: Activity[] }[] = [];
  for (const activity of items) {
    const label = dayGroupLabel(activity.at, now);
    const group = groups.at(-1);
    if (group?.label === label) group.items.push(activity);
    else groups.push({ label, items: [activity] });
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.label}>
          <h3 className="type-overline mb-3">{group.label}</h3>
          <ol>
            {group.items.map((activity, i) => (
              <Item key={activity.id} activity={activity} now={now} last={i === group.items.length - 1} />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
