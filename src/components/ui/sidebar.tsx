import type { HTMLAttributes, ReactNode } from "react";
import { NavLink } from "react-router";
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
  onNavigate,
}: SidebarItemProps) {
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
          "group relative flex h-8 items-center gap-2.5 rounded-md text-sm font-medium outline-none transition-[background-color,color,box-shadow] duration-150 focus-visible:shadow-focus",
          collapsed ? "w-8 justify-center" : "w-full px-2.5",
          isActive
            ? "bg-white text-ink shadow-xs ring-1 ring-border"
            : "text-muted hover:bg-white/70 hover:text-ink active:bg-white",
          disabled && "pointer-events-none opacity-40",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              "size-4 shrink-0 transition-colors duration-150",
              isActive ? "text-primary" : "text-subtle group-hover:text-muted",
            )}
            aria-hidden
          />
          {!collapsed && <span className="flex-1 truncate">{label}</span>}
          {badge !== undefined &&
            (collapsed ? (
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary ring-2 ring-canvas" />
            ) : (
              <span
                className={cn(
                  "rounded-sm px-1.5 font-mono text-2xs font-medium tabular-nums",
                  isActive ? "bg-primary-soft text-primary-active" : "bg-sunken text-muted",
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
        "flex h-full shrink-0 flex-col border-r border-border bg-canvas transition-[width] duration-200 ease-standard",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar",
        className,
      )}
      {...props}
    />
  );
}
