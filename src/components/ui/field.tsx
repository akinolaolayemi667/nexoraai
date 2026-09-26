import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export type FieldStatus = "default" | "error" | "success";

export type FieldMessageProps = {
  hint?: ReactNode;
  error?: ReactNode;
  success?: ReactNode | boolean;
};

export type FieldProps = FieldMessageProps & {
  id: string;
  label?: ReactNode;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

export function fieldStatus({ error, success }: FieldMessageProps): FieldStatus {
  if (error) return "error";
  if (success) return "success";
  return "default";
}

export function Field({
  id,
  label,
  hint,
  error,
  success,
  required,
  optional,
  className,
  children,
}: FieldProps) {
  const message = error ?? (typeof success === "boolean" ? null : success) ?? hint;
  const status = fieldStatus({ error, success });

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="flex items-center gap-1 text-sm font-medium text-ink">
          {label}
          {required && <span className="text-danger" aria-hidden>*</span>}
          {optional && <span className="font-normal text-subtle">(optional)</span>}
        </label>
      )}
      {children}
      {message && (
        <p
          id={`${id}-message`}
          className={cn(
            "flex items-start gap-1.5 text-xs",
            status === "error" && "text-danger-text",
            status === "success" && "text-success-text",
            status === "default" && "text-muted",
          )}
        >
          {status === "error" && <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />}
          {status === "success" && <CheckCircle2 className="mt-px size-3.5 shrink-0" aria-hidden />}
          {message}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, messages: FieldMessageProps) {
  const hasMessage =
    messages.error || messages.hint || (messages.success && typeof messages.success !== "boolean");
  return hasMessage ? `${id}-message` : undefined;
}

export const controlBase =
  "w-full rounded-md border bg-white text-base text-ink shadow-xs outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-subtle disabled:cursor-not-allowed disabled:border-border disabled:bg-canvas disabled:text-subtle disabled:shadow-none read-only:bg-canvas";

export function controlState(status: FieldStatus) {
  switch (status) {
    case "error":
      return "border-danger hover:border-danger focus:border-danger focus:shadow-focus-danger";
    case "success":
      return "border-success hover:border-success focus:border-success focus:shadow-focus-success";
    default:
      return "border-border hover:border-border-strong focus:border-primary focus:shadow-focus";
  }
}

export function StatusAdornment({ status, loading }: { status: FieldStatus; loading?: boolean }) {
  if (loading) return <Loader2 className="size-4 animate-spin text-subtle" aria-hidden />;
  if (status === "error") return <AlertCircle className="size-4 text-danger" aria-hidden />;
  if (status === "success") return <CheckCircle2 className="size-4 text-success" aria-hidden />;
  return null;
}
