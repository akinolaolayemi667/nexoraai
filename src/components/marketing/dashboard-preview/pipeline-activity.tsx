import { AnimatePresence, motion } from "framer-motion";
import { formatCompact } from "@/lib/format";
import { chartColor } from "@/lib/tokens";
import { duration, ease } from "@/lib/motion";
import { Card } from "@/components/ui";
import { activityIcons, formatAgo, pipelineStages, type Activity } from "./preview-data";

export function PipelineActivity({ activity, now, live }: { activity: Activity[]; now: number; live: boolean }) {
  const total = pipelineStages.reduce((sum, stage) => sum + stage.value, 0);

  return (
    <Card padding="none" className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <div>
          <p className="text-sm font-semibold text-ink">Pipeline activity</p>
          <p className="text-xs text-muted">
            <span className="text-metric text-ink">${formatCompact(total)}</span> open across{" "}
            {pipelineStages.reduce((sum, stage) => sum + stage.deals, 0)} deals
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-2xs font-medium text-success-text">
          <span className="relative flex size-1.5">
            {live && <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />}
            <span className="relative inline-flex size-1.5 rounded-full bg-success" />
          </span>
          {live ? "Live" : "Paused"}
        </span>
      </div>

      <div className="px-4 pt-3">
        <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
          {pipelineStages.map((stage, i) => (
            <motion.span
              key={stage.label}
              className="h-full"
              style={{ backgroundColor: chartColor(i) }}
              initial={{ width: 0 }}
              whileInView={{ width: `${(stage.value / total) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: duration.slower * 2, ease: ease.emphasized, delay: i * 0.08 }}
            />
          ))}
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {pipelineStages.map((stage, i) => (
            <div key={stage.label} className="min-w-0">
              <p className="flex items-center gap-1.5 truncate text-2xs text-muted">
                <span className="size-1.5 shrink-0 rounded-xs" style={{ backgroundColor: chartColor(i) }} />
                {stage.label}
              </p>
              <p className="text-metric text-xs font-medium text-ink">${formatCompact(stage.value)}</p>
            </div>
          ))}
        </div>
      </div>

      <ul className="mt-3 flex flex-col border-t border-border-subtle px-2 py-1.5">
        <AnimatePresence initial={false}>
          {activity.map((item) => {
            const { icon: Icon, className } = activityIcons[item.kind];
            return (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.emphasized } }}
                exit={{ opacity: 0, transition: { duration: duration.fast } }}
                className="flex items-center gap-3 rounded-md px-2 py-2"
              >
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-md ${className}`}>
                  <Icon className="size-3.5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-ink">
                    <span className="font-semibold">{item.subject}</span> <span className="text-muted">{item.action}</span>
                  </p>
                  <p className="truncate text-2xs text-subtle">{item.meta}</p>
                </div>
                <span className="shrink-0 text-2xs text-subtle">{formatAgo(now - item.createdAt)}</span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </Card>
  );
}
