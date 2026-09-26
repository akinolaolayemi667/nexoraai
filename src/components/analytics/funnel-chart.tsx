import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { duration, ease } from "@/lib/motion";

export type FunnelStage = { label: string; value: number; color: string };

const grid = "grid grid-cols-[4.75rem_1fr_3.5rem] gap-3 sm:grid-cols-[5.5rem_1fr_4rem]";

export function FunnelChart({ stages, "aria-label": ariaLabel = "Conversion funnel" }: { stages: FunnelStage[]; "aria-label"?: string }) {
  const top = Math.max(1, stages[0]?.value ?? 1);
  return (
    <ol role="figure" aria-label={ariaLabel} className="flex h-full flex-col justify-center">
      {stages.map((stage, i) => {
        const width = Math.max(4, (stage.value / top) * 100);
        const prev = stages[i - 1];
        const step = prev && prev.value > 0 ? (stage.value / prev.value) * 100 : null;
        return (
          <li key={stage.label}>
            {step !== null && (
              <p className={cn(grid, "py-1 text-2xs text-subtle")}>
                <span className="col-start-2 flex items-center justify-center gap-1">
                  <ArrowDown className="size-3" aria-hidden />
                  <span className="font-mono tabular-nums text-muted">{step.toFixed(1)}%</span> moved on
                </span>
              </p>
            )}
            <div className={cn(grid, "items-center")}>
              <span className="truncate text-sm text-muted">{stage.label}</span>
              <div className="flex h-9 justify-center rounded-md bg-canvas">
                <motion.div
                  className="h-full rounded-md"
                  style={{ backgroundColor: stage.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: duration.slower, ease: ease.emphasized, delay: i * 0.06 }}
                />
              </div>
              <span className="text-right">
                <span className="block font-mono text-sm font-semibold tabular-nums text-ink">{formatNumber(stage.value)}</span>
                <span className="block font-mono text-2xs tabular-nums text-subtle">{((stage.value / top) * 100).toFixed(1)}%</span>
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
