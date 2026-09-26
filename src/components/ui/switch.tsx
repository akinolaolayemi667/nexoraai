import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  size?: "sm" | "md";
  id?: string;
  className?: string;
  "aria-label"?: string;
};

export function Switch({ checked, onCheckedChange, label, description, disabled = false, size = "md", id, className, ...props }: SwitchProps) {
  const autoId = useId();
  const switchId = id ?? autoId;
  const control = (
    <button
      id={switchId}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={props["aria-label"]}
      aria-describedby={description ? `${switchId}-desc` : undefined}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full outline-none transition-colors duration-150 focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-4.5 w-8" : "h-5 w-9",
        checked ? "bg-primary" : "bg-border-strong",
        !label && className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-0.5 rounded-full bg-white shadow-xs transition-transform duration-150 ease-standard",
          size === "sm" ? "size-3.5" : "size-4",
          checked && (size === "sm" ? "translate-x-3.5" : "translate-x-4"),
        )}
      />
    </button>
  );

  if (!label) return control;

  return (
    <div className={cn("flex items-start justify-between gap-4", disabled && "opacity-60", className)}>
      <div className="min-w-0">
        <label htmlFor={switchId} className={cn("block text-sm font-medium text-ink", !disabled && "cursor-pointer")}>
          {label}
        </label>
        {description && (
          <p id={`${switchId}-desc`} className="mt-0.5 text-sm text-muted">
            {description}
          </p>
        )}
      </div>
      <span className="mt-0.5 flex">{control}</span>
    </div>
  );
}
