import { Link } from "react-router";
import { ArrowUpRight, Briefcase, CalendarDays, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { isOpenStage } from "@/lib/crm/constants";
import type { Deal } from "@/lib/crm/types";
import { formatCurrency, formatDate, formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Button, EmptyState, buttonVariants } from "@/components/ui";
import { OwnerChip, StageBadge } from "@/components/crm/crm-ui";

export function DealsTab({ deals, now, onAddDeal }: { deals: Deal[]; now: number; onAddDeal: () => void }) {
  if (deals.length === 0) {
    return (
      <EmptyState
        size="sm"
        bordered
        icon={<Briefcase />}
        title="No deals yet"
        description="Create a deal to track value, probability and stage for this contact."
        action={
          <Button size="sm" leftIcon={<Plus />} onClick={onAddDeal}>
            Add deal
          </Button>
        }
      />
    );
  }

  const open = deals.filter((d) => isOpenStage(d.stage));
  const openValue = open.reduce((sum, d) => sum + d.value, 0);
  const won = deals.filter((d) => d.stage === "won").reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          <span className="font-mono tabular-nums text-ink">{formatCurrency(openValue)}</span> open
          {won > 0 && (
            <>
              {" "}· <span className="font-mono tabular-nums text-success-text">{formatCurrency(won)}</span> won
            </>
          )}
        </p>
        <Button size="sm" variant="secondary" leftIcon={<Plus />} onClick={onAddDeal}>
          Add deal
        </Button>
      </div>
      <ul className="space-y-3">
        {deals.map((deal) => (
          <li key={deal.id} className={cn("rounded-lg border border-border p-4", deal.stage === "lost" && "bg-canvas opacity-75")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{deal.name}</p>
                <p className="truncate text-xs text-muted">{deal.company}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-base font-semibold tabular-nums text-ink">{formatCurrency(deal.value)}</p>
                <p className="font-mono text-2xs tabular-nums text-muted">{deal.probability}% probability</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
              <StageBadge stage={deal.stage} />
              <OwnerChip ownerId={deal.ownerId} />
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5" aria-hidden />
                {deal.closedAt ? `Closed ${formatDate(deal.closedAt)}` : `Closes ${formatDate(deal.expectedClose)}`}
              </span>
              <span className="font-mono tabular-nums">Updated {formatRelative(deal.lastActivityAt, now).toLowerCase()}</span>
              <Link
                to={`${routes.app.pipeline}?deal=${deal.id}`}
                className={buttonVariants({ variant: "ghost", size: "xs", className: "ml-auto -mr-2" })}
              >
                Open in pipeline
                <ArrowUpRight />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
