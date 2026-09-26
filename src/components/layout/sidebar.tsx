import { NavLink } from "react-router";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { appNavigation, appSecondaryNavigation, type AppNavItem } from "@/data/navigation";
import { Tooltip } from "@/components/ui";
import { Logo } from "./logo";

function SidebarLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: AppNavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const link = (
    <NavLink
      to={item.href}
      end={item.href === routes.app.root}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group flex h-8 items-center gap-2.5 rounded-md text-[13px] font-medium transition-colors",
          collapsed ? "w-8 justify-center" : "px-2.5",
          isActive
            ? "bg-white text-ink shadow-xs ring-1 ring-border"
            : "text-muted hover:bg-white/70 hover:text-ink",
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={cn(
              "size-4 shrink-0 transition-colors",
              isActive ? "text-primary" : "text-subtle group-hover:text-muted",
            )}
          />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  );

  return collapsed ? (
    <Tooltip content={item.label} side="right">
      {link}
    </Tooltip>
  ) : (
    link
  );
}

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col justify-between gap-6" aria-label="Main">
      <div className="flex flex-col gap-5">
        {appNavigation.map((section, index) => (
          <div key={section.label ?? index} className="flex flex-col gap-0.5">
            {section.label &&
              (collapsed ? (
                <div className="mx-auto mb-1 h-px w-5 bg-border" />
              ) : (
                <p className="mb-1 px-2.5 text-[11px] font-medium uppercase tracking-wider text-subtle">
                  {section.label}
                </p>
              ))}
            {section.items.map((item) => (
              <SidebarLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-0.5">
        {appSecondaryNavigation.map((item) => (
          <SidebarLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </div>
    </nav>
  );
}

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-canvas transition-[width] duration-200 lg:flex",
        collapsed ? "w-[60px] items-center px-2" : "w-60 px-3",
      )}
    >
      <div className={cn("flex h-14 items-center", collapsed ? "justify-center" : "px-1.5")}>
        <Logo to={routes.app.root} collapsed={collapsed} />
      </div>
      <div className="scrollbar-thin flex flex-1 flex-col overflow-y-auto py-3">
        <SidebarNav collapsed={collapsed} />
      </div>
      <div className={cn("border-t border-border py-3", collapsed ? "flex justify-center" : "")}>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex h-8 items-center gap-2.5 rounded-md text-[13px] text-muted transition-colors hover:bg-white/70 hover:text-ink",
            collapsed ? "w-8 justify-center" : "w-full px-2.5",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}
