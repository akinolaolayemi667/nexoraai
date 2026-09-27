import type { HTMLAttributes, ReactNode } from "react";
import { NavLink } from "react-router";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Tooltip } from "./tooltip";

export function SidebarSection({
  label,
  collapsed = false,
  children,
  className,
}: {
  label?: ReactNode;
  collapsed?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", collapsed && "items-center", className)}>
      {label &&
        (collapsed ? (
          <div className="mb-1.5 h-px w-5 bg-border" aria-hidden />
        ) : (
          <p className="type-overline mb-1 px-2.5">{label}</p>
        ))}
      {children}
    </div>
  );
}

export type SidebarItemProps = {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  collapsed?: boolean;
  end?: boolean;
  disabled?: boolean;
  tone?: "light" | "dark";
  onNavigate?: () => void;
};

export function SidebarItem({
  to,
  label,
  icon: Icon,
  badge,
  collapsed = false,
  end,
  disabled = false,
  tone = "light",
  onNavigate,
}: SidebarItemProps) {
  const dark = tone === "dark";
  const link = (
    <NavLink
      to={to}
      end={end}
      onClick={(event) => {
        if (disabled) event.preventDefault();
        else onNavigate?.();
      }}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          "group relative flex h-8 items-center gap-2.5 rounded-lg text-sm font-medium outline-none transition-[background-color,color,box-shadow] duration-150 focus-visible:shadow-focus",
          collapsed ? "w-8 justify-center" : "w-full px-2.5",
          dark
            ? isActive
              ? "font-semibold text-white"
              : "text-slate-300 hover:bg-white/10 hover:text-white active:bg-white/15"
            : isActive
              ? "font-semibold text-ink"
              : "text-muted hover:bg-white/60 hover:text-ink active:bg-white/80",
          disabled && "pointer-events-none opacity-40",
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="sidebar-active-item"
              transition={{ type: "spring", stiffness: 520, damping: 42 }}
              className={cn(
                "absolute inset-0 rounded-lg ring-1",
                dark
                  ? "bg-linear-to-r from-primary/35 via-primary/15 to-transparent shadow-[0_8px_20px_-10px_rgb(37_99_235/0.8)] ring-white/15"
                  : "bg-linear-to-r from-primary/12 via-primary/6 to-accent/5 shadow-[0_6px_16px_-8px_rgb(37_99_235/0.45)] ring-primary/15",
              )}
              aria-hidden
            >
              <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-gradient-primary" />
            </motion.span>
          )}
          <Icon
            className={cn(
              "relative size-4 shrink-0 transition-colors duration-150",
              isActive ? (dark ? "text-blue-200" : "text-primary") : dark ? "text-slate-400 group-hover:text-slate-200" : "text-subtle group-hover:text-muted",
            )}
            aria-hidden
          />
          {!collapsed && <span className="relative flex-1 truncate">{label}</span>}
          {badge !== undefined &&
            (collapsed ? (
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary ring-2 ring-canvas" />
            ) : (
              <span
                className={cn(
                  "relative rounded-sm px-1.5 font-mono text-2xs font-medium tabular-nums",
                  isActive
                    ? dark
                      ? "bg-white/15 text-white"
                      : "bg-primary-soft text-primary-active"
                    : dark
                      ? "bg-white/10 text-slate-300"
                      : "bg-sunken text-muted",
                )}
              >
                {badge}
              </span>
            ))}
        </>
      )}
    </NavLink>
  );

  return collapsed ? (
    <Tooltip content={label} side="right" className="w-8">
      {link}
    </Tooltip>
  ) : (
    link
  );
}

export function SidebarPanel({
  collapsed = false,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { collapsed?: boolean }) {
  return (
    <aside
      data-collapsed={collapsed || undefined}
      className={cn(
        "glass-panel flex h-full shrink-0 flex-col border-r border-hairline transition-[width] duration-200 ease-standard",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar",
        className,
      )}
      {...props}
    />
  );
}
