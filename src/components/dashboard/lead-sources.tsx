import { Trophy } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { Badge, Card } from "@/components/ui";
import { leadSources } from "./dashboard-data";

const totalLeads = leadSources.reduce((sum, source) => sum + source.leads, 0);
const rate = (source: (typeof leadSources)[number]) => (source.converted / source.leads) * 100;
const topSource = leadSources.reduce((best, source) => (rate(source) > rate(best) ? source : best));

export function LeadSources({ className, highlighted = false }: { className?: string; highlighted?: boolean }) {
  return (
    <Card
      id="lead-sources"
      className={cn(
        "flex scroll-mt-24 flex-col transition-[box-shadow,border-color] duration-500",
        highlighted && "border-accent-border shadow-[0_0_0_4px_var(--color-accent-soft)]",
        className,
      )}
    >
      <div className="px-5 pt-5">
        <h2 className="type-h3">Lead sources</h2>
        <p className="mt-0.5 text-sm text-muted">{formatNumber(totalLeads)} leads this month by channel.</p>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-x-4 px-5 pb-1.5 text-2xs font-medium uppercase tracking-wider text-subtle">
        <span>Source</span>
        <span className="w-10 text-right">Leads</span>
        <span className="w-12 text-right">Conv.</span>
      </div>
      <ul className="flex-1 px-5 pb-4">
        {leadSources.map((source) => {
          const top = source.id === topSource.id;
          return (
            <li key={source.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-t border-border-subtle py-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-ink">{source.name}</span>
                  {top && (
                    <Badge variant="success" icon={<Trophy />} className="shrink-0">
                      Top
                    </Badge>
                  )}
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-sunken">
                  <div
                    className={cn("h-full rounded-full", top ? "bg-success" : "bg-chart-1/70")}
                    style={{ width: `${(source.leads / totalLeads) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-10 text-right font-mono text-sm tabular-nums text-ink">{source.leads}</span>
              <span
                className={cn(
                  "w-12 text-right font-mono text-sm font-medium tabular-nums",
                  top ? "text-success-text" : "text-muted",
                )}
              >
                {rate(source).toFixed(1)}%
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
