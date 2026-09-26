import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type EmptyStateProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "default" | "error";
  bordered?: boolean;
  size?: "sm" | "md";
  titleAs?: "h1" | "h2" | "h3";
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "default",
  bordered = false,
  size = "md",
  titleAs: Title = "h3",
  className,
}: EmptyStateProps) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "sm" ? "px-4 py-8" : "px-6 py-14",
        bordered && "rounded-lg border border-dashed border-border-strong bg-canvas",
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            "mb-4 flex size-10 items-center justify-center rounded-lg border bg-white shadow-xs [&_svg]:size-5",
            tone === "error" ? "border-danger-border text-danger" : "border-border text-muted",
          )}
        >
          {icon}
        </div>
      )}
      <Title className="type-h4">{title}</Title>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5 flex items-center gap-2">{action}</div>}
    </div>
  );
}
