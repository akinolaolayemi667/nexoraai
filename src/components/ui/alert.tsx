import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export type AlertTone = "info" | "success" | "warning" | "error";

const tones: Record<AlertTone, { container: string; icon: string; Icon: typeof Info }> = {
  info: { container: "border-primary-border bg-primary-soft/40", icon: "text-primary", Icon: Info },
  success: { container: "border-success-border bg-success-soft", icon: "text-success", Icon: CheckCircle2 },
  warning: { container: "border-warning-border bg-warning-soft", icon: "text-warning", Icon: AlertTriangle },
  error: { container: "border-danger-border bg-danger-soft", icon: "text-danger", Icon: XCircle },
};

export type AlertProps = {
  tone?: AlertTone;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
};

export function Alert({ tone = "info", title, description, action, onDismiss, className }: AlertProps) {
  const { container, icon, Icon } = tones[tone];
  return (
    <div
      role={tone === "error" || tone === "warning" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-lg border px-4 py-3", container, className)}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", icon)} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        {action && <div className="mt-2.5 flex items-center gap-2">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-sm p-0.5 text-subtle transition-colors hover:text-ink"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
