import { useId, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import {
  Field,
  controlBase,
  controlState,
  describedBy,
  fieldStatus,
  type FieldMessageProps,
} from "./field";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  FieldMessageProps & {
    label?: ReactNode;
    optional?: boolean;
    containerClassName?: string;
    ref?: React.Ref<HTMLTextAreaElement>;
  };

export function Textarea({
  id,
  label,
  hint,
  error,
  success,
  optional,
  required,
  className,
  containerClassName,
  rows = 4,
  ...props
}: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const status = fieldStatus({ error, success });

  return (
    <Field
      id={textareaId}
      label={label}
      hint={hint}
      error={error}
      success={success}
      required={required}
      optional={optional}
      className={containerClassName}
    >
      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={status === "error" || undefined}
        aria-describedby={describedBy(textareaId, { error, hint, success })}
        className={cn(controlBase, controlState(status), "resize-y px-3 py-2", className)}
        {...props}
      />
    </Field>
  );
}
