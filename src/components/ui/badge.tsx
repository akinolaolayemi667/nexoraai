import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant = "neutral" | "primary" | "accent" | "success" | "warning" | "danger";

const variants: Record<BadgeVariant, { badge: string; dot: string }> = {
  neutral: { badge: "bg-canvas text-muted ring-border", dot: "bg-subtle" },
  primary: { badge: "bg-primary-soft/60 text-primary ring-primary/15", dot: "bg-primary" },
  accent: { badge: "bg-accent-soft text-accent ring-accent/15", dot: "bg-accent" },
  success: { badge: "bg-success-soft text-success ring-success/20", dot: "bg-success" },
  warning: { badge: "bg-warning-soft text-amber-700 ring-warning/25", dot: "bg-warning" },
  danger: { badge: "bg-danger-soft text-danger ring-danger/20", dot: "bg-danger" },
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  dot?: boolean;
  size?: "sm" | "md";
};

export function Badge({
  variant = "neutral",
  dot = false,
  size = "sm",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded font-medium ring-1 ring-inset",
        size === "sm" ? "h-5 px-1.5 text-[11px]" : "h-6 px-2 text-xs",
        variants[variant].badge,
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("size-1.5 rounded-full", variants[variant].dot)} aria-hidden />}
      {children}
    </span>
  );
}
