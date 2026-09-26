import { useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  Field,
  controlBase,
  controlState,
  describedBy,
  fieldStatus,
  type FieldMessageProps,
} from "./field";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> &
  FieldMessageProps & {
    options: SelectOption[];
    label?: ReactNode;
    optional?: boolean;
    placeholder?: string;
    size?: "sm" | "md" | "lg";
    containerClassName?: string;
    ref?: React.Ref<HTMLSelectElement>;
  };

const sizes = { sm: "h-8 pl-2.5 text-sm", md: "h-9 pl-3", lg: "h-10 pl-3.5" };

export function Select({
  id,
  options,
  label,
  hint,
  error,
  success,
  optional,
  placeholder,
  size = "md",
  required,
  className,
  containerClassName,
  ...props
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const status = fieldStatus({ error, success });

  return (
    <Field
      id={selectId}
      label={label}
      hint={hint}
      error={error}
      success={success}
      required={required}
      optional={optional}
      className={containerClassName}
    >
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={status === "error" || undefined}
          aria-describedby={describedBy(selectId, { error, hint, success })}
          className={cn(
            controlBase,
            controlState(status),
            "cursor-pointer appearance-none pr-9",
            sizes[size],
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
      </div>
    </Field>
  );
}
