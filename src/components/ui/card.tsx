import type { HTMLAttributes, ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";
import { Skeleton } from "./loading-state";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

const paddings = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };

export function Card({
  interactive = false,
  selected = false,
  disabled = false,
  padding = "none",
  className,
  onKeyDown,
  ...props
}: CardProps) {
  const isInteractive = interactive && !disabled;
  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      data-selected={selected || undefined}
      aria-pressed={interactive ? selected : undefined}
      aria-disabled={disabled || undefined}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (isInteractive && (event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
          event.preventDefault();
          event.currentTarget.click();
        }
      }}
      className={cn(
        "rounded-lg border bg-white shadow-sm outline-none",
        selected ? "border-primary shadow-focus" : "border-border",
        interactive &&
          !disabled &&
          "cursor-pointer transition-[border-color,box-shadow,background-color] duration-150 hover:border-border-strong hover:shadow-md focus-visible:border-primary focus-visible:shadow-focus active:bg-canvas",
        disabled && "pointer-events-none opacity-60",
        paddings[padding],
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-5", className)}>
      <div className="min-w-0">
        <h3 className="type-h4">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-b-lg border-t border-border bg-canvas px-5 py-3",
        className,
      )}
      {...props}
    />
  );
}

export type MetricCardProps = {
  label: ReactNode;
  value: ReactNode;
  change?: number;
  changeLabel?: ReactNode;
  invertTrend?: boolean;
  icon?: ReactNode;
  chart?: ReactNode;
  loading?: boolean;
  className?: string;
};

export function MetricCard({
  label,
  value,
  change,
  changeLabel,
  invertTrend = false,
  icon,
  chart,
  loading = false,
  className,
}: MetricCardProps) {
  const direction = change === undefined || change === 0 ? "flat" : change > 0 ? "up" : "down";
  const good = direction === "flat" ? null : (direction === "up") !== invertTrend;
  const TrendIcon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

  return (
    <Card padding="md" className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted">{label}</span>
        {icon && <span className="text-subtle [&_svg]:size-4">{icon}</span>}
      </div>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      ) : (
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="type-metric">{value}</div>
            {change !== undefined && (
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 font-mono font-medium tabular-nums",
                    good === null ? "text-muted" : good ? "text-success-text" : "text-danger-text",
                  )}
                >
                  <TrendIcon className="size-3.5" aria-hidden />
                  {formatPercent(change)}
                </span>
                {changeLabel && <span className="text-subtle">{changeLabel}</span>}
              </div>
            )}
          </div>
          {chart && <div className="h-10 w-24 shrink-0">{chart}</div>}
        </div>
      )}
    </Card>
  );
}
