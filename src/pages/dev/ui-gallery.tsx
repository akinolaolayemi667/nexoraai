import { Link } from "react-router";
import { routes } from "@/lib/routes";
import { Logo } from "@/components/layout/logo";
import { buttonVariants } from "@/components/ui";
import { ChartsSection } from "./design-system/charts";
import { ComponentsSection } from "./design-system/components";
import { FoundationsSection } from "./design-system/foundations";
import { MotionSection } from "./design-system/motion";

const toc = [
  {
    label: "Foundations",
    href: "#foundations",
    children: [
      ["Color", "#colors"],
      ["Typography", "#typography"],
      ["Spacing", "#spacing"],
      ["Radius", "#radius"],
      ["Borders", "#borders"],
      ["Elevation", "#shadows"],
    ],
  },
  {
    label: "Components",
    href: "#components",
    children: [
      ["Buttons", "#buttons"],
      ["Inputs", "#inputs"],
      ["Badges & avatars", "#badges"],
      ["Cards", "#cards"],
      ["Feedback", "#feedback"],
      ["Tables", "#tables"],
      ["Overlays", "#overlays"],
      ["Navigation", "#navigation"],
    ],
  },
  {
    label: "Charts",
    href: "#charts",
    children: [
      ["Area & line", "#chart-area"],
      ["Bar & donut", "#chart-bar"],
      ["Sparklines & states", "#chart-states"],
    ],
  },
  {
    label: "Motion",
    href: "#motion",
    children: [
      ["Presets", "#motion-presets"],
      ["Stagger", "#motion-stagger"],
      ["Page transition", "#motion-page"],
      ["Timing tokens", "#motion-tokens"],
    ],
  },
] as const;

export default function UiGalleryPage() {
  return (
    <div className="min-h-screen bg-white">
      <title>Design system · NEXORA AI</title>
      <header className="sticky top-0 z-30 border-b border-border bg-white/95">
        <div className="mx-auto flex h-topbar max-w-content items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Logo to={routes.home} />
            <span className="h-5 w-px bg-border" />
            <span className="text-sm font-medium text-muted">Design system</span>
          </div>
          <Link to={routes.app.root} className={buttonVariants({ variant: "secondary", size: "sm" })}>
            Open app
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-content gap-12 px-6">
        <aside className="scrollbar-thin sticky top-topbar hidden h-[calc(100vh-var(--spacing-topbar))] w-52 shrink-0 overflow-y-auto py-10 lg:block">
          <nav aria-label="Design system" className="flex flex-col gap-6">
            {toc.map((group) => (
              <div key={group.href}>
                <a href={group.href} className="type-overline rounded-xs text-ink outline-none hover:text-primary focus-visible:shadow-focus">
                  {group.label}
                </a>
                <ul className="mt-2 flex flex-col gap-0.5 border-l border-border">
                  {group.children.map(([label, href]) => (
                    <li key={href}>
                      <a
                        href={href}
                        className="-ml-px block border-l border-transparent py-1 pl-3 text-sm text-muted outline-none transition-colors hover:border-border-strong hover:text-ink focus-visible:border-primary focus-visible:text-ink"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 py-10">
          <div className="mb-14 max-w-3xl">
            <p className="type-overline text-primary">NEXORA AI · v1.0</p>
            <h1 className="type-display mt-2">Design system</h1>
            <p className="mt-4 text-lg text-muted">
              Tokens, components, charts and motion for a calm, precise business operating system. Built with
              Tailwind v4, React 19 and Framer Motion.
            </p>
          </div>
          <FoundationsSection />
          <ComponentsSection />
          <ChartsSection />
          <MotionSection />
        </main>
      </div>
    </div>
  );
}
