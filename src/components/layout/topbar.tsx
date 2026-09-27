import { Link, useLocation, useNavigate } from "react-router";
import {
  BookOpen,
  ChevronDown,
  CreditCard,
  Gift,
  Globe,
  HelpCircle,
  Keyboard,
  LifeBuoy,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { useAuth, useUser } from "@/lib/auth/auth-context";
import { findNavLocation } from "@/data/navigation";
import { usePageCrumb } from "@/hooks/use-page-crumb";
import { Avatar, Breadcrumbs, Button, Dropdown, useToast, type BreadcrumbItem } from "@/components/ui";
import { LogoMark } from "./logo";
import { NotificationsMenu } from "./notifications-menu";
import { WorkspaceSwitcher, type Workspace } from "./workspace-switcher";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

function useBreadcrumbs(): { title: string; crumbs: BreadcrumbItem[] } {
  const { pathname } = useLocation();
  const pageCrumb = usePageCrumb();
  const location = findNavLocation(pathname);
  const sectionTitle = location?.item.label ?? "Page";
  if (!location || location.item.href === routes.app.root) return { title: sectionTitle, crumbs: [{ label: sectionTitle }] };
  const isDetail = pathname.replace(/\/$/, "") !== location.item.href;
  return {
    title: isDetail && pageCrumb ? pageCrumb : sectionTitle,
    crumbs: [
      { label: "Overview", to: routes.app.root },
      ...(location.section.label ? [{ label: location.section.label }] : []),
      { label: sectionTitle, to: isDetail ? location.item.href : undefined },
      ...(isDetail ? [{ label: pageCrumb ?? "Details" }] : []),
    ],
  };
}

export function Topbar({
  onOpenMobileNav,
  onOpenCommand,
  onOpenShortcuts,
  workspaces,
  workspace,
  onSwitchWorkspace,
}: {
  onOpenMobileNav: () => void;
  onOpenCommand: () => void;
  onOpenShortcuts: () => void;
  workspaces: Workspace[];
  workspace: Workspace;
  onSwitchWorkspace: (id: string) => void;
}) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const user = useUser();
  const { title, crumbs } = useBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 h-topbar shrink-0 bg-linear-to-b from-canvas via-canvas/70 to-transparent px-2 py-2 sm:px-3 lg:pr-4">
      <div className="flex h-12 items-center gap-2 rounded-2xl border border-white/80 bg-white/50 px-2.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_12px_40px_-18px_rgb(30_64_175/0.35)] backdrop-blur-2xl sm:px-4">
        <Button
          variant="ghost"
          size="icon-sm"
          className="-ml-1 md:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
        >
          <Menu />
        </Button>

        <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
          <Link to={routes.app.root} className="shrink-0 rounded-md outline-none focus-visible:shadow-focus md:hidden" aria-label="NEXORA AI overview">
            <LogoMark className="size-6" />
          </Link>
          <span className="truncate font-display text-md font-semibold text-ink">{title}</span>
        </div>

        <Breadcrumbs className="hidden lg:block" items={crumbs} />

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={onOpenCommand}
            className="hidden h-8 w-52 items-center gap-2 rounded-lg border border-hairline bg-white/60 px-2.5 text-sm text-subtle shadow-[inset_0_1px_2px_rgb(15_23_42/0.04)] outline-none transition-[border-color,box-shadow,color,background-color] duration-150 hover:border-primary/25 hover:bg-white/90 hover:text-muted focus-visible:border-primary focus-visible:shadow-focus md:flex xl:w-72"
          >
            <Search className="size-3.5" aria-hidden />
            <span className="flex-1 truncate text-left">Search anything…</span>
            <kbd className="rounded-md border border-border bg-white px-1.5 font-mono text-2xs text-muted shadow-xs">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>
          <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={onOpenCommand} aria-label="Search">
            <Search />
          </Button>

          <NotificationsMenu />

          <Dropdown
            align="end"
            width="w-60"
            className="hidden sm:inline-flex"
            items={[
              {
                label: "Documentation",
                description: "Guides and API reference",
                icon: <BookOpen />,
                onSelect: () => toast({ title: "Docs open in a new tab once the help center launches." }),
              },
              {
                label: "Keyboard shortcuts",
                icon: <Keyboard />,
                shortcut: "?",
                onSelect: onOpenShortcuts,
              },
              {
                label: "Contact support",
                description: "Median reply under 2 hours",
                icon: <LifeBuoy />,
                onSelect: () =>
                  toast({ variant: "success", title: "Support request started", description: "We'll reply to your email shortly." }),
              },
              { label: "What's new", icon: <Gift />, onSelect: () => toast({ title: "You're on the latest release." }) },
            ]}
            trigger={({ open, ...props }) => (
              <Button
                {...props}
                variant="ghost"
                size="icon-sm"
                className={cn(open && "bg-sunken/70 text-ink")}
                aria-label="Help"
              >
                <HelpCircle />
              </Button>
            )}
          />

          <div className="mx-1.5 hidden h-5 w-px bg-border lg:block" aria-hidden />

          <div className="hidden lg:flex">
            <WorkspaceSwitcher workspaces={workspaces} current={workspace} onSwitch={onSwitchWorkspace} />
          </div>

          <Dropdown
            align="end"
            header={
              <div className="flex items-center gap-2.5">
                <Avatar name={user.name} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{user.name}</p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
              </div>
            }
            items={[
              { label: "Profile", icon: <User />, onSelect: () => navigate(routes.app.settings) },
              { label: "Settings", icon: <Settings />, onSelect: () => navigate(routes.app.settings) },
              { label: "Billing", icon: <CreditCard />, onSelect: () => navigate(routes.app.billing) },
              { type: "separator" },
              { label: "Back to website", icon: <Globe />, onSelect: () => navigate(routes.home) },
              { label: "Log out", icon: <LogOut />, danger: true, onSelect: signOut },
            ]}
            trigger={({ open, ...props }) => (
              <button
                type="button"
                {...props}
                className={cn(
                  "ml-0.5 flex items-center gap-1.5 rounded-full p-0.5 outline-none transition-colors duration-150 hover:bg-canvas focus-visible:shadow-focus sm:rounded-md sm:py-1 sm:pl-1 sm:pr-1.5",
                  open && "bg-canvas",
                )}
                aria-label={`Account menu for ${user.name}`}
              >
                <Avatar name={user.name} size="sm" status="online" />
                <ChevronDown
                  className={cn(
                    "hidden size-3.5 text-subtle transition-transform duration-150 sm:block",
                    open && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
            )}
          />
        </div>
      </div>
    </header>
  );
}
