import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  Field,
  StatusAdornment,
  controlBase,
  controlState,
  describedBy,
  fieldStatus,
  type FieldMessageProps,
} from "./field";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  FieldMessageProps & {
    label?: ReactNode;
    optional?: boolean;
    leftIcon?: ReactNode;
    rightSlot?: ReactNode;
    loading?: boolean;
    size?: "sm" | "md" | "lg";
    containerClassName?: string;
    ref?: React.Ref<HTMLInputElement>;
  };

const sizes = {
  sm: { input: "h-8 px-2.5 text-sm", icon: "pl-8", iconLeft: "left-2.5" },
  md: { input: "h-9 px-3", icon: "pl-9", iconLeft: "left-3" },
  lg: { input: "h-10 px-3.5", icon: "pl-10", iconLeft: "left-3.5" },
};

export function Input({
  id,
  label,
  hint,
  error,
  success,
  optional,
  leftIcon,
  rightSlot,
  loading = false,
  size = "md",
  className,
  containerClassName,
  required,
  ...props
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const status = fieldStatus({ error, success });
  const adornment = rightSlot ?? <StatusAdornment status={status} loading={loading} />;
  const hasAdornment = Boolean(rightSlot) || loading || status !== "default";

  return (
    <Field
      id={inputId}
      label={label}
      hint={hint}
      error={error}
      success={success}
      required={required}
      optional={optional}
      className={containerClassName}
    >
      <div className="relative">
        {leftIcon && (
          <span
            className={cn(
              "pointer-events-none absolute inset-y-0 flex items-center text-subtle [&_svg]:size-4",
              sizes[size].iconLeft,
            )}
          >
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={status === "error" || undefined}
          aria-busy={loading || undefined}
          aria-describedby={describedBy(inputId, { error, hint, success })}
          className={cn(
            controlBase,
            controlState(status),
            sizes[size].input,
            leftIcon && sizes[size].icon,
            hasAdornment && "pr-9",
            className,
          )}
          {...props}
        />
        {hasAdornment && (
          <span className="absolute inset-y-0 right-2.5 flex items-center text-subtle">{adornment}</span>
        )}
      </div>
    </Field>
  );
}
