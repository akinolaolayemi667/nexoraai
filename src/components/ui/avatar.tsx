import { useState } from "react";
import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/format";

type Size = "xs" | "sm" | "md" | "lg" | "xl";
type Status = "online" | "away" | "offline";

const sizes: Record<Size, string> = {
  xs: "size-5 text-[0.5625rem]",
  sm: "size-7 text-2xs",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
  xl: "size-14 text-lg",
};

const palette = [
  "bg-primary-soft text-primary-active",
  "bg-accent-soft text-accent-hover",
  "bg-success-soft text-success-text",
  "bg-warning-soft text-warning-text",
  "bg-danger-soft text-danger-text",
  "bg-sky-50 text-sky-700",
  "bg-sunken text-muted",
];

const statusColors: Record<Status, string> = {
  online: "bg-success",
  away: "bg-warning",
  offline: "bg-subtle",
};

function colorFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length];
}

export type AvatarProps = {
  name: string;
  src?: string;
  size?: Size;
  status?: Status;
  className?: string;
};

export function Avatar({ name, src, size = "md", status, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center overflow-hidden rounded-full font-semibold ring-1 ring-black/5",
          sizes[size],
          !showImage && colorFor(name),
        )}
        title={name}
      >
        {showImage ? (
          <img
            src={src}
            alt={name}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <span aria-label={name}>{getInitials(name)}</span>
        )}
      </span>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block size-2 rounded-full ring-2 ring-white",
            statusColors[status],
          )}
          aria-label={status}
        />
      )}
    </span>
  );
}

export function AvatarGroup({
  names,
  max = 4,
  size = "sm",
}: {
  names: string[];
  max?: number;
  size?: Size;
}) {
  const visible = names.slice(0, max);
  const rest = names.length - visible.length;
  return (
    <div className="flex -space-x-2">
      {visible.map((name) => (
        <Avatar key={name} name={name} size={size} className="rounded-full ring-2 ring-white" />
      ))}
      {rest > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-sunken font-medium text-muted ring-2 ring-white",
            sizes[size],
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
