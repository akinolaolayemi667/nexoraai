import type { HTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-4 animate-spin text-primary", className)} aria-hidden />;
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded bg-[linear-gradient(90deg,#f1f5f9_0%,#e2e8f0_40%,#f1f5f9_80%)] bg-[length:800px_100%]",
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
      <span className="text-[13px]">{label}</span>
    </div>
  );
}

export function PageLoader() {
  return <LoadingState className="min-h-[50vh]" />;
}
