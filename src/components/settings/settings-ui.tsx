import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SettingsCard({ title, description, action, children, footer, className }: { title: ReactNode; description?: ReactNode; action?: ReactNode; children: ReactNode; footer?: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-border bg-white shadow-xs", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        {action}
      </div>
      <div className="divide-y divide-border">{children}</div>
      {footer && <div className="flex flex-col-reverse gap-2 rounded-b-lg border-t border-border bg-canvas px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-5">{footer}</div>}
    </section>
  );
}

/** Label on the left, control on the right from `md`; stacked on small screens. */
export function SettingRow({ label, description, htmlFor, children, wide = false, className }: { label: ReactNode; description?: ReactNode; htmlFor?: string; children: ReactNode; wide?: boolean; className?: string }) {
  return (
    <div className={cn("grid gap-2 px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-6", className)}>
      <div className="min-w-0">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
            {label}
          </label>
        ) : (
          <p className="text-sm font-medium text-ink">{label}</p>
        )}
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      <div className={cn("min-w-0", !wide && "md:max-w-md")}>{children}</div>
    </div>
  );
}

/** Full-width row for switches: text left, toggle right at every size. */
export function ToggleRow({ children }: { children: ReactNode }) {
  return <div className="px-4 py-4 sm:px-5">{children}</div>;
}

export function RadioCards<T extends string>({ name, value, onChange, options, columns = 3 }: { name: string; value: T; onChange: (v: T) => void; options: { value: T; label: string; description?: ReactNode }[]; columns?: 2 | 3 }) {
  return (
    <div role="radiogroup" className={cn("grid gap-2", columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <label
            key={o.value}
            className={cn(
              "flex cursor-pointer flex-col rounded-md border p-3 transition-colors",
              selected ? "border-primary bg-primary-soft/40 ring-1 ring-primary" : "border-border hover:border-border-strong hover:bg-canvas",
            )}
          >
            <span className="flex items-center gap-2">
              <input type="radio" name={name} value={o.value} checked={selected} onChange={() => onChange(o.value)} className="size-4 accent-primary" />
              <span className="text-sm font-medium text-ink">{o.label}</span>
            </span>
            {o.description && <span className="mt-1.5 pl-6 text-xs text-muted">{o.description}</span>}
          </label>
        );
      })}
    </div>
  );
}
