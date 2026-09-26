import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function DocSection({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border py-14 first:border-t-0 first:pt-0">
      <p className="type-overline text-primary">{eyebrow}</p>
      <h2 className="type-h1 mt-1.5">{title}</h2>
      {description && <p className="type-body-sm mt-2 max-w-2xl">{description}</p>}
      <div className="mt-10 flex flex-col gap-12">{children}</div>
    </section>
  );
}

export function DocBlock({
  id,
  title,
  description,
  children,
  className,
}: {
  id?: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div id={id} className={cn("scroll-mt-20", className)}>
      <h3 className="type-h3">{title}</h3>
      {description && <p className="type-body-sm mt-1 max-w-2xl">{description}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function Specimen({
  children,
  label,
  className,
  tone = "white",
}: {
  children: ReactNode;
  label?: ReactNode;
  className?: string;
  tone?: "white" | "canvas";
}) {
  return (
    <div className={cn("rounded-lg border border-border", tone === "canvas" ? "bg-canvas" : "bg-white")}>
      {label && <div className="type-overline border-b border-border-subtle px-5 py-2.5">{label}</div>}
      <div className={cn("p-6", className)}>{children}</div>
    </div>
  );
}

export function StateCell({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-2.5">
      <div>
        <p className="type-overline">{label}</p>
        <p className="mt-0.5 h-4 text-2xs text-subtle">{hint}</p>
      </div>
      {children}
    </div>
  );
}

export function Token({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-xs border border-border-subtle bg-canvas px-1 py-px font-mono text-2xs text-muted">
      {children}
    </code>
  );
}
