import { Fragment, useId } from "react";
import { Link } from "react-router";
import { LayoutGroup } from "framer-motion";
import { ChevronsLeft, ChevronsRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { appNavigation } from "@/data/navigation";
import { useUser } from "@/lib/auth/auth-context";
import { useInboxUnread } from "@/lib/inbox/use-inbox";
import { Progress, SidebarItem, SidebarPanel, SidebarSection, Tooltip } from "@/components/ui";
import { Logo } from "./logo";

const aiCredits = { used: 1240, limit: 2000 };

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const unread = useInboxUnread(useUser().id);
  const groupId = useId();
  return (
    <LayoutGroup id={groupId}>
      <nav className="flex flex-col gap-3" aria-label="Main">
        {appNavigation.map((section, index) => (
          <Fragment key={section.id}>
            {index > 0 && (
              <div
                role="separator"
                className={cn(
                  "h-px shrink-0 bg-linear-to-r from-transparent via-slate-300/70 to-transparent",
                  collapsed ? "mx-auto w-6" : "mx-2.5",
                )}
              />
            )}
            <SidebarSection collapsed={collapsed}>
              {section.items.map((item) => (
                <SidebarItem
                  key={item.href}
                  to={item.href}
                  label={item.label}
                  icon={item.icon}
                  badge={item.href === routes.app.conversations ? unread || undefined : item.badge}
                  end={item.href === routes.app.root}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </SidebarSection>
          </Fragment>
        ))}
      </nav>
    </LayoutGroup>
  );
}

export function UsageCard({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="glass-ai rounded-xl p-3 shadow-none!">
      <div className="flex items-center gap-2">
        <span className="flex size-5 items-center justify-center rounded-md bg-gradient-ai text-white">
          <Sparkles className="size-3" aria-hidden />
        </span>
        <p className="text-xs font-semibold text-ink">AI credits</p>
        <span className="ml-auto font-mono text-2xs text-muted">
          {formatNumber(aiCredits.used)}/{formatNumber(aiCredits.limit)}
        </span>
      </div>
      <Progress value={aiCredits.used} max={aiCredits.limit} tone="accent" className="mt-2.5" />
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <p className="text-2xs text-muted">Resets Oct 1</p>
        <Link
          to={routes.app.billing}
          onClick={onNavigate}
          className="rounded-xs text-2xs font-medium text-primary outline-none hover:underline focus-visible:shadow-focus"
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
}

export function Sidebar({
  collapsed,
  onToggle,
  expandLabel = "Expand sidebar",
}: {
  collapsed: boolean;
  onToggle: () => void;
  expandLabel?: string;
}) {
  const toggle = (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex h-8 items-center gap-2.5 rounded-md text-sm text-muted outline-none transition-colors duration-150 hover:bg-white/70 hover:text-ink active:bg-white focus-visible:shadow-focus",
        collapsed ? "w-8 justify-center" : "w-full px-2.5",
      )}
      aria-label={collapsed ? expandLabel : "Collapse sidebar"}
    >
      {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
      {!collapsed && (
        <>
          <span className="flex-1 text-left">Collapse</span>
          <kbd className="rounded-xs border border-border bg-white px-1.5 font-mono text-2xs text-subtle">[</kbd>
        </>
      )}
    </button>
  );

  return (
    <div className="sticky top-0 z-20 hidden h-dvh shrink-0 py-2 pl-2 md:flex">
      <SidebarPanel
        collapsed={collapsed}
        className={cn(
          "rounded-2xl border border-glass-border bg-glass-strong! shadow-glass-float",
          collapsed ? "items-center px-2" : "px-3",
        )}
      >
        <div className={cn("flex h-12 shrink-0 items-center", collapsed ? "justify-center" : "px-1.5")}>
          <Logo to={routes.app.root} collapsed={collapsed} />
        </div>
        <div className="scrollbar-thin flex flex-1 flex-col overflow-y-auto py-3">
          <SidebarNav collapsed={collapsed} />
        </div>
        <div className={cn("flex flex-col gap-3 border-t border-hairline py-3", collapsed && "items-center")}>
          {!collapsed && <UsageCard />}
          {collapsed ? (
            <Tooltip content={expandLabel} shortcut={expandLabel === "Expand sidebar" ? "[" : undefined} side="right">
              {toggle}
            </Tooltip>
          ) : (
            toggle
          )}
        </div>
      </SidebarPanel>
    </div>
  );
}
