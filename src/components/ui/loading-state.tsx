import type { HTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <Loader2
      className={cn("size-4 animate-spin text-primary", className)}
      aria-hidden={!label}
      aria-label={label}
      role={label ? "status" : undefined}
    />
  );
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-sm bg-sunken bg-[linear-gradient(90deg,var(--color-sunken)_0%,var(--color-border)_40%,var(--color-sunken)_80%)] bg-[length:800px_100%]",
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}

export function LoadingState({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn("flex flex-col items-center justify-center gap-3 py-16 text-muted", className)}
    >
      <Spinner className="size-5" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function PageLoader() {
  return <LoadingState className="min-h-[50vh]" />;
}
