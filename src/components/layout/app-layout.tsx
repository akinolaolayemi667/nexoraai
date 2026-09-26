import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { routes } from "@/lib/routes";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Drawer, PageLoader } from "@/components/ui";
import { CommandMenu } from "./command-menu";
import { Logo } from "./logo";
import { Sidebar, SidebarNav } from "./sidebar";
import { Topbar } from "./topbar";

export function AppLayout() {
  const [collapsed, setCollapsed] = useLocalStorage("nexora:sidebar-collapsed", false);
  const mobileNav = useDisclosure();
  const command = useDisclosure();
  const { pathname } = useLocation();
  const { close: closeMobileNav } = mobileNav;
  const { toggle: toggleCommand } = command;

  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggleCommand();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleCommand]);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <Drawer
        open={mobileNav.isOpen}
        onClose={mobileNav.close}
        side="left"
        size="sm"
        title={<Logo to={routes.app.root} />}
      >
        <SidebarNav onNavigate={mobileNav.close} />
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileNav={mobileNav.open} onOpenCommand={command.open} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      <CommandMenu open={command.isOpen} onClose={command.close} />
    </div>
  );
}
