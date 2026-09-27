import { Suspense, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth/auth-context";
import { routes } from "@/lib/routes";
import { footerColumns, marketingNavigation, type MarketingMenuItem } from "@/data/marketing";
import { Avatar, Badge, Button, Dropdown, PageLoader, TopNavLink, buttonVariants } from "@/components/ui";
import { Logo } from "./logo";
import { MAIN_CONTENT_ID, SkipLink } from "./skip-link";

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

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function MobileMenu() {
  return (
    <div className="max-h-[calc(100dvh-6rem)] overflow-y-auto border-t border-hairline px-4 pb-5 pt-2 sm:px-5 lg:hidden">
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
                          className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-ink outline-none transition-colors hover:bg-white/70 active:bg-white focus-visible:shadow-focus"
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
              className="rounded-lg px-2 py-3 text-sm font-medium text-ink outline-none transition-colors hover:bg-white/70 active:bg-white focus-visible:shadow-focus"
            >
              {entry.label}
            </Link>
          ),
        )}
      </nav>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <AccountActions stacked />
      </div>
    </div>
  );
}

function AccountActions({ stacked = false }: { stacked?: boolean }) {
  const { user } = useAuth();

  if (user) {
    return (
      <>
        {!stacked && <Avatar name={user.name} size="sm" />}
        <Link to={routes.app.root} className={buttonVariants({ className: cn(stacked && "col-span-2") })}>
          Open app
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </>
    );
  }

  return (
    <>
      <Link to={routes.login} className={buttonVariants({ variant: stacked ? "secondary" : "ghost" })}>
        Log In
      </Link>
      <Link to={routes.signup} className={buttonVariants()}>
        Start Free
      </Link>
    </>
  );
}

function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { key } = useLocation();
  const { user } = useAuth();

  const scrolled = useScrolled();

  useEffect(() => setMenuOpen(false), [key]);

  const raised = scrolled || menuOpen;

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <div
        className={cn(
          "mx-auto max-w-6xl rounded-2xl border backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow] duration-300 ease-standard",
          raised
            ? "border-glass-border bg-glass-strong shadow-glass-float"
            : "border-white/50 bg-white/45 shadow-[0_0_0_1px_rgb(148_163_184/0.08)]",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-6 pl-4 pr-2 sm:pl-5 sm:pr-3">
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
            <AccountActions />
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to={user ? routes.app.root : routes.signup}
              className={buttonVariants({ size: "sm", className: "hidden sm:inline-flex" })}
            >
              {user ? "Open app" : "Start Free"}
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
      </div>
    </header>
  );
}

function MarketingFooter() {
  return (
    <footer className="border-t border-hairline bg-white/50" aria-label="Site footer">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 py-14 md:grid-cols-6">
        <div className="col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">
            AI-powered operations for modern businesses. Leads, workflows, customers and insight in one intelligent
            workspace.
          </p>
        </div>
        {footerColumns.map((column) => (
          <nav key={column.title} aria-labelledby={`footer-${column.title.toLowerCase().replace(/\s+/g, "-")}`}>
            <h2
              id={`footer-${column.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="type-overline font-sans text-ink"
            >
              {column.title}
            </h2>
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
          </nav>
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
    <div className="bg-ambient flex min-h-screen flex-col">
      <SkipLink />
      <MarketingHeader />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <MarketingFooter />
    </div>
  );
}
