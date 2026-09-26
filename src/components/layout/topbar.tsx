import { useLocation, useNavigate } from "react-router";
import {
  Bell,
  ChevronDown,
  CreditCard,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { currentUser, findNavItem } from "@/data/navigation";
import { Avatar, Breadcrumbs, Button, Dropdown, Tooltip } from "@/components/ui";

export function Topbar({
  onOpenMobileNav,
  onOpenCommand,
}: {
  onOpenMobileNav: () => void;
  onOpenCommand: () => void;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = findNavItem(pathname);
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="sticky top-0 z-30 flex h-topbar items-center gap-3 border-b border-border bg-white/95 px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <Menu />
      </Button>

      <Breadcrumbs
        className="hidden sm:block"
        items={[
          { label: currentUser.workspace, to: routes.app.root },
          { label: current?.label ?? "Page" },
        ]}
      />

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenCommand}
          className="hidden h-8 w-64 items-center gap-2 rounded-md border border-border bg-canvas px-2.5 text-sm text-subtle outline-none transition-[border-color,box-shadow,color] duration-150 hover:border-border-strong hover:text-muted focus-visible:border-primary focus-visible:shadow-focus md:flex"
        >
          <Search className="size-3.5" />
          <span className="flex-1 text-left">Search or jump to…</span>
          <kbd className="rounded-xs border border-border bg-white px-1.5 font-mono text-2xs text-muted">
            {isMac ? "⌘K" : "Ctrl K"}
          </kbd>
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={onOpenCommand}
          aria-label="Search"
        >
          <Search />
        </Button>

        <Tooltip content="Help & docs" side="bottom">
          <Button variant="ghost" size="icon-sm" aria-label="Help">
            <HelpCircle />
          </Button>
        </Tooltip>
        <Tooltip content="Notifications" side="bottom">
          <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative">
            <Bell />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary ring-2 ring-white" />
          </Button>
        </Tooltip>

        <div className="mx-1.5 h-5 w-px bg-border" />

        <Dropdown
          align="end"
          header={
            <div>
              <p className="text-sm font-medium text-ink">{currentUser.name}</p>
              <p className="text-xs text-muted">{currentUser.email}</p>
            </div>
          }
          items={[
            { label: "Profile", icon: <User />, onSelect: () => navigate(routes.app.settings) },
            { label: "Settings", icon: <Settings />, onSelect: () => navigate(routes.app.settings) },
            { label: "Billing", icon: <CreditCard />, onSelect: () => navigate(routes.app.billing) },
            { type: "separator" },
            { label: "Log out", icon: <LogOut />, danger: true, onSelect: () => navigate(routes.login) },
          ]}
          trigger={({ open, ...props }) => (
            <button
              type="button"
              {...props}
              className={cn(
                "flex items-center gap-2 rounded-md py-1 pl-1 pr-1.5 outline-none transition-colors duration-150 hover:bg-canvas active:bg-sunken focus-visible:shadow-focus",
                open && "bg-canvas",
              )}
              aria-label="Account menu"
            >
              <Avatar name={currentUser.name} size="sm" status="online" />
              <ChevronDown
                className={cn("hidden size-3.5 text-subtle transition-transform duration-150 sm:block", open && "rotate-180")}
              />
            </button>
          )}
        />
      </div>
    </header>
  );
}
