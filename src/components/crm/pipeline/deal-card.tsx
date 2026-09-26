import { memo, type DragEvent } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { dealStages, isOpenStage, ownerById } from "@/lib/crm/constants";
import type { Deal, DealStage, Lead } from "@/lib/crm/types";
import { formatCurrency, formatRelative } from "@/lib/format";
import { transitions } from "@/lib/motion";
import { Avatar, Button, Dropdown } from "@/components/ui";

const STALE_AFTER = 7 * 24 * 3600_000;

export const DealCard = memo(function DealCard({
  deal,
  contact,
  now,
  dragging,
  highlighted,
  menuSide,
  onOpen,
  onMove,
  onDragStart,
  onDragEnd,
}: {
  deal: Deal;
  contact?: Lead;
  now: number;
  dragging: boolean;
  highlighted: boolean;
  menuSide: "top" | "bottom";
  onOpen: (id: string) => void;
  onMove: (id: string, stage: DealStage) => void;
  onDragStart: (id: string, event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}) {
  const owner = ownerById(deal.ownerId);
  const stale = isOpenStage(deal.stage) && now - deal.lastActivityAt > STALE_AFTER;
  const staleDays = Math.floor((now - deal.lastActivityAt) / (24 * 3600_000));

  return (
    <motion.div layout="position" layoutId={deal.id} transition={transitions.spring}>
      <div
        role="button"
        tabIndex={0}
        draggable
        data-deal-id={deal.id}
        aria-label={`${deal.company}, ${deal.name}, ${formatCurrency(deal.value)}, ${deal.probability}% probability`}
        onDragStart={(event) => onDragStart(deal.id, event)}
        onDragEnd={onDragEnd}
        onClick={() => onOpen(deal.id)}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
            event.preventDefault();
            onOpen(deal.id);
          }
        }}
        className={cn(
          "group relative cursor-grab select-none rounded-lg border bg-white p-3 shadow-xs outline-none transition-[box-shadow,border-color,opacity,transform] duration-150 active:cursor-grabbing",
          "hover:border-border-strong hover:shadow-md focus-visible:border-primary focus-visible:shadow-focus",
          dragging ? "scale-[0.98] border-dashed border-primary-border opacity-40 shadow-none" : "border-border",
          highlighted && "border-primary shadow-focus",
          deal.stage === "lost" && "bg-canvas opacity-70 hover:opacity-100",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{deal.company}</p>
            <p className="truncate text-xs text-muted">{deal.name}</p>
          </div>
          <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} className="-mr-1.5 -mt-1">
            <Dropdown
              align="end"
              side={menuSide}
              width="w-48"
              items={[
                { type: "label", label: "Move to" },
                ...dealStages.map((stage) => ({
                  label: stage.label,
                  icon: <span className="m-1 block size-2 rounded-full" style={{ backgroundColor: stage.color }} />,
                  disabled: stage.id === deal.stage,
                  onSelect: () => onMove(deal.id, stage.id),
                })),
                { type: "separator" },
                { label: "Open details", onSelect: () => onOpen(deal.id) },
              ]}
              trigger={({ open, ...props }) => (
                <Button
                  {...props}
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Move or open ${deal.company}`}
                  className={cn(
                    "text-subtle transition-opacity",
                    open ? "bg-sunken text-ink opacity-100" : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100",
                  )}
                >
                  <MoreHorizontal />
                </Button>
              )}
            />
          </div>
        </div>

        {contact && (
          <div className="mt-2.5 flex min-w-0 items-center gap-1.5">
            <Avatar name={contact.name} size="xs" />
            <span className="truncate text-xs text-ink">{contact.name}</span>
          </div>
        )}

        <div className="mt-3 flex items-end justify-between gap-2">
          <span className="font-mono text-base font-semibold tabular-nums tracking-tight text-ink">{formatCurrency(deal.value)}</span>
          <span className="flex items-center gap-1.5" title={`${deal.probability}% probability to close`}>
            <span className="h-1 w-10 overflow-hidden rounded-full bg-sunken" aria-hidden>
              <span
                className={cn(
                  "block h-full rounded-full transition-[width] duration-500",
                  deal.stage === "won" ? "bg-success" : deal.stage === "lost" ? "bg-subtle" : "bg-primary",
                )}
                style={{ width: `${deal.probability}%` }}
              />
            </span>
            <span className="font-mono text-xs font-medium tabular-nums text-muted">{deal.probability}%</span>
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-subtle pt-2.5 text-xs text-muted">
          <span className="flex min-w-0 items-center gap-1.5">
            <Avatar name={owner.name} size="xs" />
            <span className="truncate">{owner.name.split(" ")[0]}</span>
          </span>
          {stale ? (
            <span className="flex shrink-0 items-center gap-1 font-medium text-warning-text" title="No activity for over a week">
              <AlertTriangle className="size-3" aria-hidden />
              {staleDays}d idle
            </span>
          ) : deal.stage === "won" ? (
            <span className="flex shrink-0 items-center gap-1 text-success-text">
              <CheckCircle2 className="size-3" aria-hidden />
              {formatRelative(deal.closedAt ?? deal.lastActivityAt, now)}
            </span>
          ) : (
            <span className="flex shrink-0 items-center gap-1 font-mono tabular-nums">
              <Clock className="size-3" aria-hidden />
              {formatRelative(deal.lastActivityAt, now)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});
