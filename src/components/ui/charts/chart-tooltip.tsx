import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ChartTooltipRow = { label: string; value: ReactNode; color: string };

export function ChartTooltip({
  title,
  rows,
  footer,
  className,
  style,
}: {
  title?: ReactNode;
  rows: ChartTooltipRow[];
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none min-w-36 rounded-md border border-border bg-white px-3 py-2 shadow-lg",
        className,
      )}
      style={style}
    >
      {title && <p className="mb-1.5 text-xs font-medium text-ink">{title}</p>}
      <ul className="flex flex-col gap-1">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2 text-xs">
            <span className="size-2 shrink-0 rounded-xs" style={{ backgroundColor: row.color }} aria-hidden />
            <span className="flex-1 whitespace-nowrap pr-3 text-muted">{row.label}</span>
            <span className="font-mono font-medium tabular-nums text-ink">{row.value}</span>
          </li>
        ))}
      </ul>
      {footer && <div className="mt-1.5 border-t border-border-subtle pt-1.5 text-xs text-muted">{footer}</div>}
    </div>
  );
}

export function tooltipPosition(anchorX: number, width: number, top = 8): CSSProperties {
  const flip = anchorX > width / 2;
  return {
    position: "absolute",
    top,
    left: anchorX,
    transform: flip ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
    zIndex: 10,
  };
}
