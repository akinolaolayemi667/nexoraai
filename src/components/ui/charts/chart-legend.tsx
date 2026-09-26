import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ChartLegendItem = { label: string; color: string; value?: ReactNode };

export function ChartLegend({
  items,
  orientation = "horizontal",
  className,
}: {
  items: ChartLegendItem[];
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <ul
      className={cn(
        orientation === "horizontal" ? "flex flex-wrap gap-x-5 gap-y-1.5" : "flex flex-col gap-2",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2 text-xs text-muted">
          <span className="size-2 shrink-0 rounded-xs" style={{ backgroundColor: item.color }} aria-hidden />
          <span className={cn(orientation === "vertical" && "flex-1")}>{item.label}</span>
          {item.value !== undefined && (
            <span className="font-mono font-medium tabular-nums text-ink">{item.value}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
