import type { ReactNode } from "react";
import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type FeatureMeta = {
  id: string;
  icon: LucideIcon;
  name: string;
  title: string;
  description: string;
  points?: string[];
};

function FeatureText({ meta, large = false }: { meta: FeatureMeta; large?: boolean }) {
  const Icon = meta.icon;
  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-medium text-primary">
        <span className="flex size-6 items-center justify-center rounded-sm bg-primary-soft">
          <Icon className="size-3.5" aria-hidden />
        </span>
        {meta.name}
      </p>
      <h3 className={cn("mt-3 font-display font-semibold tracking-tight text-ink", large ? "text-2xl" : "text-xl")}>
        {meta.title}
      </h3>
      <p className="mt-2 text-sm text-muted">{meta.description}</p>
      {meta.points && (
        <ul className="mt-5 flex flex-col gap-2">
          {meta.points.map((point) => (
            <li key={point} className="flex items-start gap-2 text-sm text-ink">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              {point}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AppPanel({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("glass-card overflow-hidden rounded-xl", className)}
    >
      {children}
    </div>
  );
}

export function PanelHeader({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-border px-3.5 py-2">
      <p className="text-xs font-semibold text-ink">{title}</p>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function FeatureCard({
  meta,
  className,
  children,
}: {
  meta: FeatureMeta;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      id={meta.id}
      className={cn("glass-card flex scroll-mt-24 flex-col overflow-hidden rounded-2xl", className)}
    >
      <div className="p-6 sm:p-7">
        <FeatureText meta={meta} />
      </div>
      <div className="flex flex-1 flex-col border-t border-hairline bg-white/40 p-3 sm:p-5 [&>*]:flex-1">{children}</div>
    </article>
  );
}

export function FeatureRow({
  meta,
  reverse = false,
  className,
  children,
}: {
  meta: FeatureMeta;
  reverse?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      id={meta.id}
      className={cn(
        "glass-card grid scroll-mt-24 grid-cols-1 overflow-hidden rounded-2xl lg:grid-cols-12",
        className,
      )}
    >
      <div className={cn("flex flex-col justify-center p-6 sm:p-8 lg:col-span-5 lg:p-10", reverse && "lg:order-2")}>
        <FeatureText meta={meta} large />
      </div>
      <div
        className={cn(
          "border-t border-border bg-canvas p-3 sm:p-5 lg:col-span-7 lg:border-t-0",
          reverse ? "lg:order-1 lg:border-r" : "lg:border-l",
        )}
      >
        {children}
      </div>
    </article>
  );
}
