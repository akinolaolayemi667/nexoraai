import { Suspense, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useReducedMotion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { footerColumns, marketingNavigation, type MarketingMenuItem } from "@/data/marketing";
import { Badge, Button, Dropdown, PageLoader, TopNavLink, buttonVariants } from "@/components/ui";
import { Logo } from "./logo";

const navLinkClass =
  "rounded-sm text-sm font-medium text-muted outline-none transition-colors duration-150 hover:text-ink active:text-ink focus-visible:shadow-focus";

const isHashLink = (href: string) => href.includes("#");

function useScrollToHash() {
  const { hash, key } = useLocation();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    let frame = 0;
    let attempts = 0;
    const tryScroll = () => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        return;
      }
      if (attempts++ < 60) frame = requestAnimationFrame(tryScroll);
    };
    frame = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(frame);
  }, [hash, key, reduced]);
}

function NavMenu({ label, items }: { label: string; items: MarketingMenuItem[] }) {
  const navigate = useNavigate();

  return (
    <Dropdown
      width="w-80"
      trigger={({ open, ...props }) => (
        <button type="button" {...props} className={cn(navLinkClass, "flex items-center gap-1", open && "text-ink")}>
          {label}
          <ChevronDown
            className={cn("size-3.5 transition-transform duration-150", open && "rotate-180")}
            aria-hidden
          />
        </button>
      )}
      items={items.map((item) => {
        const Icon = item.icon;
        return {
          label: item.label,
          description: item.soon ? "Coming soon" : item.description,
          icon: <Icon />,
          disabled: item.soon,
          onSelect: () => navigate(item.href),
        };
      })}
    />
  );
}

function MobileMenu() {
  return (
    <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-white px-6 pb-6 pt-2 lg:hidden">
      <nav aria-label="Mobile" className="flex flex-col divide-y divide-border-subtle">
        {marketingNavigation.map((entry) =>
          "items" in entry ? (
            <div key={entry.label} className="py-3">
              <p className="type-overline px-2 pb-1.5">{entry.label}</p>
              <ul className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
                {entry.items.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <>
                      <Icon className="size-4 shrink-0 text-muted" aria-hidden />
                      <span className="truncate">{item.label}</span>
                      {item.soon && (
                        <Badge size="sm" className="ml-auto">
                          Soon
                        </Badge>
                      )}
                    </>
                  );
                  return (
                    <li key={item.label}>
                      {item.soon ? (
                        <span className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium text-subtle">
                          {content}
                        </span>
                      ) : (
                        <Link
                          to={item.href}
                          className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium text-ink outline-none transition-colors hover:bg-canvas active:bg-sunken focus-visible:shadow-focus"
                        >
                          {content}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <Link
              key={entry.label}
              to={entry.href}
              className="rounded-md px-2 py-3 text-sm font-medium text-ink outline-none transition-colors hover:bg-canvas active:bg-sunken focus-visible:shadow-focus"
            >
              {entry.label}
            </Link>
          ),
        )}
      </nav>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link to={routes.login} className={buttonVariants({ variant: "secondary" })}>
          Log In
        </Link>
        <Link to={routes.signup} className={buttonVariants()}>
          Start Free
        </Link>
      </div>
    </div>
  );
}

function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { key } = useLocation();

  useEffect(() => setMenuOpen(false), [key]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {marketingNavigation.map((entry) =>
              "items" in entry ? (
                <NavMenu key={`${entry.label}-${key}`} label={entry.label} items={entry.items} />
              ) : isHashLink(entry.href) ? (
                <Link key={entry.label} to={entry.href} className={navLinkClass}>
                  {entry.label}
                </Link>
              ) : (
                <TopNavLink key={entry.label} to={entry.href}>
                  {entry.label}
                </TopNavLink>
              ),
            )}
          </nav>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <Link to={routes.login} className={buttonVariants({ variant: "ghost" })}>
            Log In
          </Link>
          <Link to={routes.signup} className={buttonVariants()}>
            Start Free
          </Link>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <Link to={routes.signup} className={buttonVariants({ size: "sm", className: "hidden sm:inline-flex" })}>
            Start Free
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {menuOpen && <MobileMenu />}
    </header>
  );
}

function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-canvas">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 py-14 md:grid-cols-6">
        <div className="col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">
            AI-powered operations for modern businesses. Leads, workflows, customers and insight in one intelligent
            workspace.
          </p>
        </div>
        {footerColumns.map((column) => (
          <div key={column.title}>
            <h4 className="type-overline text-ink">{column.title}</h4>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="rounded-xs text-sm text-muted outline-none transition-colors hover:text-ink focus-visible:shadow-focus"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-5 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NEXORA AI, Inc. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-success" aria-hidden />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}

export function MarketingLayout() {
  useScrollToHash();

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <MarketingFooter />
    </div>
  );
}
