import { Suspense, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { routes } from "@/lib/routes";
import { marketingNavigation } from "@/data/navigation";
import { Button, PageLoader, TopNavLink, buttonVariants } from "@/components/ui";
import { Logo } from "./logo";

function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
            {marketingNavigation.map((item) => (
              <TopNavLink key={item.href} to={item.href}>
                {item.label}
              </TopNavLink>
            ))}
          </nav>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Link to={routes.login} className={buttonVariants({ variant: "ghost" })}>
            Log in
          </Link>
          <Link to={routes.signup} className={buttonVariants()}>
            Start free trial
          </Link>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X /> : <Menu />}
        </Button>
      </div>
      {menuOpen && (
        <div className="border-t border-border px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {marketingNavigation.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="rounded-md px-2 py-2 text-md font-medium text-ink outline-none transition-colors hover:bg-canvas active:bg-sunken focus-visible:shadow-focus"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link to={routes.login} className={buttonVariants({ variant: "secondary" })}>
              Log in
            </Link>
            <Link to={routes.signup} className={buttonVariants()}>
              Start free trial
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: routes.features },
      { label: "Pricing", href: routes.pricing },
      { label: "Open app", href: routes.app.root },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: routes.login },
      { label: "Sign up", href: routes.signup },
    ],
  },
];

function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-canvas">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">
            The AI-powered operating system for modern businesses.
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
        <p className="mx-auto max-w-7xl px-6 py-5 text-xs text-subtle">
          © {new Date().getFullYear()} NEXORA AI, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export function MarketingLayout() {
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
