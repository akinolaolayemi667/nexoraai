import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { appNavigation, appSecondaryNavigation } from "@/data/navigation";
import { SidebarItem, SidebarPanel, SidebarSection, Tooltip } from "@/components/ui";
import { Logo } from "./logo";

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
          <SidebarSection key={section.label ?? index} label={section.label} collapsed={collapsed}>
            {section.items.map((item) => (
              <SidebarItem
                key={item.href}
                to={item.href}
                label={item.label}
                icon={item.icon}
                badge={item.badge}
                end={item.href === routes.app.root}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </SidebarSection>
        ))}
      </div>
      <SidebarSection collapsed={collapsed}>
        {appSecondaryNavigation.map((item) => (
          <SidebarItem
            key={item.href}
            to={item.href}
            label={item.label}
            icon={item.icon}
            badge={item.badge}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </SidebarSection>
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
  const toggle = (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex h-8 items-center gap-2.5 rounded-md text-sm text-muted outline-none transition-colors duration-150 hover:bg-white/70 hover:text-ink active:bg-white focus-visible:shadow-focus",
        collapsed ? "w-8 justify-center" : "w-full px-2.5",
      )}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
      {!collapsed && "Collapse"}
    </button>
  );

  return (
    <SidebarPanel
      collapsed={collapsed}
      className={cn("sticky top-0 hidden h-screen lg:flex", collapsed ? "items-center px-2" : "px-3")}
    >
      <div className={cn("flex h-topbar shrink-0 items-center", collapsed ? "justify-center" : "px-1.5")}>
        <Logo to={routes.app.root} collapsed={collapsed} />
      </div>
      <div className="scrollbar-thin flex flex-1 flex-col overflow-y-auto py-3">
        <SidebarNav collapsed={collapsed} />
      </div>
      <div className={cn("border-t border-border py-3", collapsed && "flex justify-center")}>
        {collapsed ? (
          <Tooltip content="Expand sidebar" shortcut="[" side="right">
            {toggle}
          </Tooltip>
        ) : (
          toggle
        )}
      </div>
    </SidebarPanel>
  );
}
