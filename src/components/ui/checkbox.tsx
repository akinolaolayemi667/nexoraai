import { useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  indeterminate?: boolean;
  label?: ReactNode;
  description?: ReactNode;
};

export function Checkbox({
  indeterminate = false,
  label,
  description,
  className,
  id,
  ...props
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  const autoId = useId();
  const inputId = id ?? autoId;

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const input = (
    <input
      ref={ref}
      id={inputId}
      type="checkbox"
      className={cn(
        "size-4 shrink-0 cursor-pointer rounded-sm border-border-strong accent-primary disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );

  if (!label) return input;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex cursor-pointer items-start gap-2.5",
        props.disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <span className="mt-0.5 flex">{input}</span>
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="block text-sm text-muted">{description}</span>}
      </span>
    </label>
  );
}
