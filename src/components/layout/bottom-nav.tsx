import { NavLink } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { transitions } from "@/lib/motion";
import { routes } from "@/lib/routes";
import { mobileNavigation } from "@/data/navigation";
import { useUser } from "@/lib/auth/auth-context";
import { useInboxUnread } from "@/lib/inbox/use-inbox";

export function BottomNav() {
  const reduceMotion = useReducedMotion();
  const unread = useInboxUnread(useUser().id);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 rounded-t-2xl border border-x-0 border-b-0 border-white/10 bg-[#0b1020]/88 pb-[env(safe-area-inset-bottom)] text-slate-300 shadow-[0_-12px_40px_-16px_rgb(2_6_23/0.45)] backdrop-blur-xl md:hidden"
    >
      <ul className="grid h-14 grid-cols-5">
        {mobileNavigation.map((item) => {
          const badge = item.href === routes.app.conversations ? unread || undefined : item.badge;
          return (
          <li key={item.href} className="flex">
            <NavLink
              to={item.href}
              end={item.href === routes.app.root}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1 text-2xs font-medium outline-none transition-colors duration-150 focus-visible:bg-canvas",
                  isActive ? "text-blue-200" : "text-slate-400 active:text-white",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId={reduceMotion ? undefined : "bottom-nav-indicator"}
                      transition={transitions.spring}
                      className="absolute inset-x-5 top-0 h-0.5 rounded-b-full bg-gradient-primary shadow-[0_2px_8px_rgb(37_99_235/0.5)]"
                      aria-hidden
                    />
                  )}
                  <span className="relative">
                    <item.icon className="size-5" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
                    {badge !== undefined && (
                      <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 font-mono text-[0.5625rem] font-semibold leading-none text-white ring-2 ring-white">
                        {badge}
                      </span>
                    )}
                  </span>
                  {item.shortLabel ?? item.label}
                </>
              )}
            </NavLink>
          </li>
          );
        })}
      </ul>
    </nav>
  );
}
