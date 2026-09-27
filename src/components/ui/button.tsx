import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "link";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon-xs" | "icon-sm" | "icon" | "icon-lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary bg-gradient-primary text-white shadow-[0_1px_2px_rgb(15_23_42/0.12),inset_0_1px_0_rgb(255_255_255/0.18)] hover:bg-primary-hover hover:shadow-glow hover:brightness-110 active:brightness-95 focus-visible:shadow-focus",
  secondary:
    "border border-border/90 bg-white/80 text-ink shadow-xs hover:border-border-strong hover:bg-white active:bg-sunken focus-visible:border-primary focus-visible:shadow-focus",
  ghost:
    "text-muted hover:bg-sunken/70 hover:text-ink active:bg-sunken focus-visible:bg-sunken/70 focus-visible:text-ink focus-visible:shadow-focus",
  danger:
    "bg-danger text-white shadow-xs hover:bg-danger-hover active:bg-danger-text focus-visible:shadow-focus-danger",
  success:
    "bg-success text-white shadow-xs hover:bg-success-hover active:bg-success-text focus-visible:shadow-focus-success",
  link: "h-auto px-0 text-primary underline-offset-4 hover:underline active:text-primary-active focus-visible:underline",
};

const sizes: Record<ButtonSize, string> = {
  xs: "h-7 gap-1 rounded-md px-2 text-xs [&_svg]:size-3.5",
  sm: "h-8 gap-1.5 rounded-md px-3 text-sm [&_svg]:size-4",
  md: "h-9 gap-2 rounded-md px-3.5 text-sm [&_svg]:size-4",
  lg: "h-10 gap-2 rounded-lg px-4 text-base [&_svg]:size-4",
  "icon-xs": "size-7 rounded-md [&_svg]:size-3.5",
  "icon-sm": "size-8 rounded-md [&_svg]:size-4",
  icon: "size-9 rounded-md [&_svg]:size-4",
  "icon-lg": "size-10 rounded-lg [&_svg]:size-4",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    "group/button relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium outline-none transition-[background-color,border-color,color,box-shadow,transform,filter] duration-200 ease-standard active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress [&_svg]:shrink-0 [&_.lucide-arrow-right]:transition-transform [&_.lucide-arrow-right]:duration-200 hover:[&_.lucide-arrow-right]:translate-x-0.5",
    variant === "link" ? "rounded-sm text-sm" : sizes[size],
    variants[variant],
    className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: ReactNode;
  success?: boolean;
  successText?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
};

export function Button({
  variant,
  size,
  loading = false,
  loadingText,
  success = false,
  successText,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const isIconOnly = size?.startsWith("icon");
  let content: ReactNode = children;
  let leading = leftIcon;
  let trailing = rightIcon;

  if (loading) {
    leading = <Loader2 className="animate-spin" aria-hidden />;
    trailing = null;
    content = isIconOnly ? null : (loadingText ?? children);
  } else if (success) {
    leading = <Check aria-hidden />;
    trailing = null;
    content = isIconOnly ? null : (successText ?? children);
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-state={loading ? "loading" : success ? "success" : undefined}
      className={buttonVariants({
        variant: success && variant !== "link" && variant !== "ghost" ? "success" : variant,
        size,
        className,
      })}
      {...props}
    >
      {leading}
      {content}
      {trailing}
    </button>
  );
}
