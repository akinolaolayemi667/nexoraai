import { Suspense, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router";
import { ArrowLeft, Check, Kanban, Sparkles, Target } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { routes } from "@/lib/routes";
import { Avatar, FadeIn, PageLoader, Sparkline } from "@/components/ui";
import { Logo } from "./logo";
import { MAIN_CONTENT_ID, SkipLink } from "./skip-link";

const activity = [
  { icon: Target, text: "12 new leads scored overnight", tone: "bg-primary-soft text-primary-active" },
  { icon: Sparkles, text: "3 follow-ups drafted by AI", tone: "bg-accent-soft text-accent-hover" },
  { icon: Kanban, text: "Brightline moved to Proposal", tone: "bg-success-soft text-success-text" },
];

const signupPerks = ["14-day free trial of Growth", "No credit card required", "Import from HubSpot, Salesforce or CSV"];

function AuthShowcase({ signup }: { signup: boolean }) {
  return (
    <aside className="relative hidden overflow-hidden border-l border-hairline bg-white/30 lg:flex">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border-subtle)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border-subtle)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        aria-hidden
      />
      <FadeIn className="relative m-auto w-full max-w-md px-10 py-16" key={signup ? "signup" : "login"}>
        <p className="type-overline text-primary">AI-powered business operations</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
          {signup ? "Your intelligent business system starts here." : "Pick up right where your team left off."}
        </h2>

        <div className="glass-strong mt-8 overflow-hidden rounded-2xl" aria-hidden>
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-semibold text-ink">Today in Nexora HQ</p>
            <span className="flex items-center gap-1.5 text-2xs text-success-text">
              <span className="size-1.5 rounded-full bg-success" />
              Live
            </span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
            <div className="px-4 py-3">
              <p className="text-2xs text-muted">Revenue</p>
              <div className="flex items-end justify-between gap-2">
                <p className="text-metric text-lg font-semibold text-ink">$214.6K</p>
                <Sparkline data={[18, 22, 21, 26, 25, 30, 34]} className="h-6 w-14" />
              </div>
              <p className="font-mono text-2xs text-success-text">+18.2%</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-2xs text-muted">Conversion</p>
              <p className="text-metric text-lg font-semibold text-ink">5.2%</p>
              <p className="font-mono text-2xs text-success-text">+1.1 pts</p>
            </div>
          </div>
          <ul className="flex flex-col gap-2 p-3">
            {activity.map(({ icon: Icon, text, tone }) => (
              <li key={text} className="flex items-center gap-2.5 rounded-md px-1 py-1">
                <span className={`flex size-6 shrink-0 items-center justify-center rounded-sm ${tone}`}>
                  <Icon className="size-3.5" />
                </span>
                <span className="text-xs text-ink">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {signup ? (
          <ul className="mt-8 flex flex-col gap-2.5">
            {signupPerks.map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-sm text-ink">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        ) : (
          <figure className="mt-8">
            <blockquote className="text-sm text-ink">
              “Our reps start every morning with a prioritised list and the follow-ups are already drafted.”
            </blockquote>
            <figcaption className="mt-3 flex items-center gap-2.5">
              <Avatar name="Amara Okafor" size="sm" />
              <span className="text-xs text-muted">
                <span className="font-medium text-ink">Amara Okafor</span> · VP Sales, Brightline Logistics
              </span>
            </figcaption>
          </figure>
        )}
      </FadeIn>
    </aside>
  );
}

export function AuthLayout() {
  const { user } = useAuth();
  const { pathname, state } = useLocation();
  const [arrivedSignedIn] = useState(Boolean(user));
  const signedOut = (state as { signedOut?: boolean } | null)?.signedOut;

  if (user && arrivedSignedIn && !signedOut) return <Navigate to={routes.app.root} replace />;

  return (
    <div className="bg-ambient grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_1.05fr]">
      <SkipLink />
      <div className="flex min-w-0 flex-col px-6 py-5 sm:px-10">
        <header className="flex h-10 items-center justify-between">
          <Logo />
          <Link
            to={routes.home}
            className="flex items-center gap-1.5 rounded-sm text-sm text-muted outline-none transition-colors hover:text-ink focus-visible:shadow-focus"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to site
          </Link>
        </header>
        <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex flex-1 items-center justify-center py-12 outline-none">
          <div className="w-full max-w-sm">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
        <footer className="flex flex-wrap items-center justify-between gap-2 text-xs text-subtle">
          <p>© {new Date().getFullYear()} NEXORA AI, Inc.</p>
          <p className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Security</span>
          </p>
        </footer>
      </div>
      <AuthShowcase signup={pathname === routes.signup} />
    </div>
  );
}
