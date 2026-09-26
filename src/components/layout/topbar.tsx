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
import { routes } from "@/lib/routes";
import { currentUser, findNavItem } from "@/data/navigation";
import { Avatar, Button, Dropdown, Tooltip } from "@/components/ui";

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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-white/90 px-4 backdrop-blur-sm sm:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <Menu />
      </Button>

      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-[13px] sm:flex">
        <span className="text-muted">{currentUser.workspace}</span>
        <span className="text-subtle">/</span>
        <span className="truncate font-medium text-ink">{current?.label ?? "Page"}</span>
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenCommand}
          className="hidden h-8 w-64 items-center gap-2 rounded-md border border-border bg-canvas px-2.5 text-[13px] text-subtle transition-colors hover:border-border-strong md:flex"
        >
          <Search className="size-3.5" />
          <span className="flex-1 text-left">Search or jump to…</span>
          <kbd className="rounded border border-border bg-white px-1.5 font-mono text-[10px] text-muted">
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
              <p className="text-[13px] font-medium text-ink">{currentUser.name}</p>
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
              className="flex items-center gap-2 rounded-md py-1 pl-1 pr-1.5 transition-colors hover:bg-canvas"
              aria-label="Account menu"
            >
              <Avatar name={currentUser.name} size="sm" status="online" />
              <ChevronDown
                className={`hidden size-3.5 text-subtle transition-transform sm:block ${open ? "rotate-180" : ""}`}
              />
            </button>
          )}
        />
      </div>
    </header>
  );
}
