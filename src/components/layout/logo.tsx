import { Link } from "react-router";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={cn("size-7", className)} aria-hidden>
      <rect width="28" height="28" rx="6" fill="#111827" />
      <path
        d="M8.5 19.5V8.5L19.5 19.5V8.5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19.5" cy="8.5" r="2.2" fill="#2563EB" />
    </svg>
  );
}

export function Logo({
  to = "/",
  collapsed = false,
  inverted = false,
  className,
}: {
  to?: string;
  collapsed?: boolean;
  inverted?: boolean;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn("flex items-center gap-2.5 rounded-md outline-none focus-visible:shadow-focus", className)}
      aria-label="NEXORA AI home"
    >
      <LogoMark />
      {!collapsed && (
        <span className={cn("font-display text-md font-bold tracking-tight", inverted ? "text-white" : "text-ink")}>
          NEXORA<span className={cn("ml-1 font-semibold", inverted ? "text-blue-300" : "text-primary")}>AI</span>
        </span>
      )}
    </Link>
  );
}
