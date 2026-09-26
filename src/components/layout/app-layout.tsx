import { Suspense, useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router";
import { routes } from "@/lib/routes";
import { useUser } from "@/lib/auth/auth-context";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Drawer, PageLoader, PageTransition } from "@/components/ui";
import { useNoIndex } from "@/components/seo";
import { BottomNav } from "./bottom-nav";
import { CommandMenu } from "./command-menu";
import { Logo } from "./logo";
import { ShortcutsDialog } from "./shortcuts-dialog";
import { MAIN_CONTENT_ID, SkipLink } from "./skip-link";
import { Sidebar, SidebarNav, UsageCard } from "./sidebar";
import { Topbar } from "./topbar";
import { WorkspaceSwitcher, type Workspace } from "./workspace-switcher";

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

function useWorkspaces() {
  const user = useUser();
  const workspaces = useMemo<Workspace[]>(
    () => [
      { id: "primary", name: user.company, plan: "Growth", members: 12, tone: "ink" },
      { id: "sandbox", name: "Sandbox", plan: "Free", members: 3, tone: "accent" },
    ],
    [user.company],
  );
  const [workspaceId, setWorkspaceId] = useLocalStorage(`nexora:workspace:${user.id}`, "primary");
  const workspace = workspaces.find((w) => w.id === workspaceId) ?? workspaces[0];
  return { workspaces, workspace, setWorkspaceId };
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useLocalStorage("nexora:sidebar-collapsed", false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const mobileNav = useDisclosure();
  const command = useDisclosure();
  const shortcuts = useDisclosure();
  const { workspaces, workspace, setWorkspaceId } = useWorkspaces();
  const { pathname } = useLocation();
  const workspaceMode = [routes.app.ai, routes.app.conversations, `${routes.app.automations}/`].some((href) => pathname.startsWith(href));
  const { close: closeMobileNav } = mobileNav;
  const { toggle: toggleCommand } = command;
  const { open: openShortcuts } = shortcuts;
  useNoIndex();

  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  useEffect(() => {
    document.documentElement.dataset.bottomNav = "";
    return () => {
      delete document.documentElement.dataset.bottomNav;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggleCommand();
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) return;
      if (event.key === "[") setCollapsed((v) => !v);
      else if (event.key === "?") openShortcuts();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleCommand, openShortcuts, setCollapsed]);

  return (
    <div className="flex min-h-dvh bg-white">
      <SkipLink />
      <Sidebar
        collapsed={isDesktop ? collapsed : true}
        onToggle={() => (isDesktop ? setCollapsed((v) => !v) : mobileNav.open())}
        expandLabel={isDesktop ? "Expand sidebar" : "Open menu"}
      />

      <Drawer
        open={mobileNav.isOpen}
        onClose={mobileNav.close}
        side="left"
        size="xs"
        title={<Logo to={routes.app.root} />}
      >
        <div className="flex min-h-full flex-col gap-5">
          <WorkspaceSwitcher
            variant="block"
            workspaces={workspaces}
            current={workspace}
            onSwitch={setWorkspaceId}
            onNavigate={mobileNav.close}
          />
          <SidebarNav onNavigate={mobileNav.close} />
          <div className="mt-auto">
            <UsageCard onNavigate={mobileNav.close} />
          </div>
        </div>
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onOpenMobileNav={mobileNav.open}
          onOpenCommand={command.open}
          onOpenShortcuts={shortcuts.open}
          workspaces={workspaces}
          workspace={workspace}
          onSwitchWorkspace={setWorkspaceId}
        />
        {workspaceMode ? (
          <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex h-[calc(100dvh-var(--spacing-topbar)-3.5rem-env(safe-area-inset-bottom))] min-h-0 flex-col overflow-hidden outline-none md:h-[calc(100dvh-var(--spacing-topbar))]">
            <Suspense fallback={<PageLoader />}>
              <PageTransition key={pathname} className="flex min-h-0 flex-1 flex-col">
                <Outlet />
              </PageTransition>
            </Suspense>
          </main>
        ) : (
          <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 px-4 outline-none pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pt-6 md:pb-10 lg:px-8">
            <div className="mx-auto w-full max-w-content min-[1800px]:max-w-[100rem]">
              <Suspense fallback={<PageLoader />}>
                <PageTransition key={pathname}>
                  <Outlet />
                </PageTransition>
              </Suspense>
            </div>
          </main>
        )}
      </div>

      <BottomNav />
      <CommandMenu open={command.isOpen} onClose={command.close} />
      <ShortcutsDialog open={shortcuts.isOpen} onClose={shortcuts.close} />
    </div>
  );
}
