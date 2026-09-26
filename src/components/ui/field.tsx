import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type FieldProps = {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

export function Field({ id, label, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-ink">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function describedBy(id: string, error?: ReactNode, hint?: ReactNode) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export const controlBase =
  "w-full rounded-md border bg-white text-sm text-ink shadow-xs outline-none transition-colors placeholder:text-subtle disabled:cursor-not-allowed disabled:bg-canvas disabled:text-subtle";

export function controlState(error?: ReactNode) {
  return error
    ? "border-danger focus:border-danger focus:ring-3 focus:ring-danger/15"
    : "border-border hover:border-border-strong focus:border-primary focus:ring-3 focus:ring-primary/15";
}
