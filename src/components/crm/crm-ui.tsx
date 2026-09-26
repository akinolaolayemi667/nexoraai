import { cn } from "@/lib/cn";
import { ownerById, scoreTier, stageMeta, statusMeta } from "@/lib/crm/constants";
import type { DealStage, LeadStatus } from "@/lib/crm/types";
import { Avatar } from "@/components/ui";

export function StatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 whitespace-nowrap rounded-sm px-1.5 text-2xs font-medium ring-1 ring-inset",
        meta.badge,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  );
}

export function StageBadge({ stage, className }: { stage: DealStage; className?: string }) {
  const meta = stageMeta[stage];
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 whitespace-nowrap rounded-sm bg-sunken px-1.5 text-2xs font-medium text-ink ring-1 ring-inset ring-border",
        className,
      )}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: meta.color }} aria-hidden />
      {meta.label}
    </span>
  );
}

const tierStyles = {
  hot: { bar: "bg-success", text: "text-success-text" },
  warm: { bar: "bg-primary", text: "text-primary-active" },
  cool: { bar: "bg-warning", text: "text-warning-text" },
  cold: { bar: "bg-subtle", text: "text-muted" },
};

export function ScorePill({ score, className }: { score: number; className?: string }) {
  const tier = tierStyles[scoreTier(score)];
  return (
    <span className={cn("inline-flex items-center gap-2", className)} title={`Lead score ${score} of 100`}>
      <span className={cn("w-6 text-right font-mono text-sm font-semibold tabular-nums", tier.text)}>{score}</span>
      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-sunken" aria-hidden>
        <span className={cn("block h-full rounded-full", tier.bar)} style={{ width: `${score}%` }} />
      </span>
    </span>
  );
}

export function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const tier = scoreTier(score);
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = {
    hot: "var(--color-success)",
    warm: "var(--color-primary)",
    cool: "var(--color-warning)",
    cold: "var(--color-subtle)",
  }[tier];
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }} role="img" aria-label={`Lead score ${score}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-sunken)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          className="transition-[stroke-dashoffset] duration-700 ease-emphasized"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-md font-semibold tabular-nums text-ink">
        {score}
      </span>
    </span>
  );
}

export function OwnerChip({ ownerId, hideNameOnMobile = false }: { ownerId: string; hideNameOnMobile?: boolean }) {
  const owner = ownerById(ownerId);
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <Avatar name={owner.name} size="xs" />
      <span className={cn("truncate text-sm text-ink", hideNameOnMobile && "hidden sm:inline")}>{owner.name}</span>
    </span>
  );
}