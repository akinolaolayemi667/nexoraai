import type { HTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/tokens";

export type BadgeVariant = Tone;

const tones: Record<Tone, { soft: string; outline: string; solid: string; dot: string }> = {
  neutral: {
    soft: "bg-sunken text-muted ring-border",
    outline: "bg-white text-muted ring-border-strong",
    solid: "bg-ink text-white ring-ink",
    dot: "bg-subtle",
  },
  primary: {
    soft: "bg-primary-soft/60 text-primary-active ring-primary-border",
    outline: "bg-white text-primary ring-primary-border",
    solid: "bg-primary text-white ring-primary",
    dot: "bg-primary",
  },
  accent: {
    soft: "bg-accent-soft text-accent ring-accent-border",
    outline: "bg-white text-accent ring-accent-border",
    solid: "bg-accent bg-gradient-ai text-white ring-accent",
    dot: "bg-accent",
  },
  success: {
    soft: "bg-success-soft text-success-text ring-success-border",
    outline: "bg-white text-success-text ring-success-border",
    solid: "bg-success text-white ring-success",
    dot: "bg-success",
  },
  warning: {
    soft: "bg-warning-soft text-warning-text ring-warning-border",
    outline: "bg-white text-warning-text ring-warning-border",
    solid: "bg-warning text-ink ring-warning",
    dot: "bg-warning",
  },
  danger: {
    soft: "bg-danger-soft text-danger-text ring-danger-border",
    outline: "bg-white text-danger-text ring-danger-border",
    solid: "bg-danger text-white ring-danger",
    dot: "bg-danger",
  },
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: Tone;
  appearance?: "soft" | "outline" | "solid";
  size?: "sm" | "md";
  dot?: boolean;
  icon?: ReactNode;
  onRemove?: () => void;
};

export function Badge({
  variant = "neutral",
  appearance = "soft",
  size = "sm",
  dot = false,
  icon,
  onRemove,
  className,
  children,
  ...props
}: BadgeProps) {
  const tone = tones[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-sm font-medium ring-1 ring-inset [&_svg]:size-3 [&_svg]:shrink-0",
        size === "sm" ? "h-5 px-1.5 text-2xs" : "h-6 px-2 text-xs",
        tone[appearance],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("size-1.5 rounded-full", appearance === "solid" ? "bg-current" : tone.dot)}
          aria-hidden
        />
      )}
      {icon}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="-mr-0.5 ml-0.5 rounded-xs opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100"
          aria-label="Remove"
        >
          <X />
        </button>
      )}
    </span>
  );
}
