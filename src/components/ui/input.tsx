import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Field, controlBase, controlState, describedBy } from "./field";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  size?: "sm" | "md";
  containerClassName?: string;
  ref?: React.Ref<HTMLInputElement>;
};

export function Input({
  id,
  label,
  hint,
  error,
  leftIcon,
  rightSlot,
  size = "md",
  className,
  containerClassName,
  required,
  ...props
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <Field
      id={inputId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-subtle [&_svg]:size-4">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          className={cn(
            controlBase,
            controlState(error),
            size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3",
            leftIcon && (size === "sm" ? "pl-8" : "pl-9"),
            rightSlot && "pr-10",
            className,
          )}
          {...props}
        />
        {rightSlot && (
          <span className="absolute inset-y-0 right-2 flex items-center text-subtle">
            {rightSlot}
          </span>
        )}
      </div>
    </Field>
  );
}
