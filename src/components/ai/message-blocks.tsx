import { useState } from "react";
import { Link } from "react-router";
import { AlertTriangle, Check, ChevronDown, Copy, Lightbulb, Mail, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency, formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useCrm } from "@/lib/crm/crm-context";
import { ownerFirstName } from "@/lib/crm/constants";
import type { AiBlock } from "@/lib/ai/types";
import { Avatar, Button } from "@/components/ui";
import { ScorePill, StageBadge, StatusBadge } from "@/components/crm/crm-ui";

const shell = "glass-card overflow-hidden rounded-xl";

function LeadsBlock({ leadIds, now }: { leadIds: string[]; now: number }) {
  const { state } = useCrm();
  const [expanded, setExpanded] = useState(false);
  const leads = leadIds.map((id) => state.leads.find((l) => l.id === id)).filter((l) => l !== undefined);
  if (leads.length === 0) return null;
  const visible = expanded ? leads : leads.slice(0, 5);
  return (
    <div className={shell}>
      <ul className="divide-y divide-border">
        {visible.map((lead) => (
          <li key={lead.id}>
            <Link
              to={routes.app.lead(lead.id)}
              className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none"
            >
              <Avatar name={lead.name} size="sm" className="rounded-full" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{lead.name}</span>
                <span className="block truncate text-xs text-muted">
                  {lead.company} · last touch {formatRelative(lead.lastActivityAt, now).toLowerCase()}
                </span>
              </span>
              <StatusBadge status={lead.status} className="hidden sm:inline-flex" />
              <ScorePill score={lead.score} className="[&>span:last-child]:hidden sm:[&>span:last-child]:block" />
            </Link>
          </li>
        ))}
      </ul>
      {leads.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-center gap-1 border-t border-border bg-canvas py-2 text-xs font-medium text-muted transition-colors hover:text-ink"
        >
          {expanded ? "Show less" : `Show all ${leads.length}`}
          <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
        </button>
      )}
    </div>
  );
}

function DealsBlock({ dealIds, now }: { dealIds: string[]; now: number }) {
  const { state } = useCrm();
  const deals = dealIds.map((id) => state.deals.find((d) => d.id === id)).filter((d) => d !== undefined);
  if (deals.length === 0) return null;
  return (
    <div className={shell}>
      <ul className="divide-y divide-border">
        {deals.map((deal) => (
          <li key={deal.id}>
            <Link
              to={`${routes.app.pipeline}?deal=${deal.id}`}
              className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{deal.company}</span>
                <span className="block truncate text-xs text-muted">
                  {deal.name} · {ownerFirstName(deal.ownerId)} · idle {formatRelative(deal.lastActivityAt, now).replace(" ago", "")}
                </span>
              </span>
              <StageBadge stage={deal.stage} className="hidden sm:inline-flex" />
              <span className="w-20 text-right font-mono text-sm font-semibold tabular-nums text-ink">
                {formatCurrency(deal.value)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactBlock({ leadId }: { leadId: string }) {
  const { state } = useCrm();
  const lead = state.leads.find((l) => l.id === leadId);
  if (!lead) return null;
  const pipeline = state.deals
    .filter((d) => d.contactId === lead.id && d.stage !== "won" && d.stage !== "lost")
    .reduce((s, d) => s + d.value, 0);
  return (
    <Link
      to={routes.app.lead(lead.id)}
      className={cn(shell, "flex items-center gap-3 p-3 transition-colors hover:border-border-strong hover:bg-canvas")}
    >
      <Avatar name={lead.name} size="lg" className="rounded-full" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-ink">{lead.name}</span>
          <StatusBadge status={lead.status} />
        </span>
        <span className="block truncate text-xs text-muted">
          {lead.title} at {lead.company} · owned by {ownerFirstName(lead.ownerId)}
        </span>
      </span>
      <span className="hidden text-right sm:block">
        <span className="block font-mono text-sm font-semibold tabular-nums text-ink">{formatCurrency(pipeline)}</span>
        <span className="block text-2xs text-muted">open pipeline</span>
      </span>
      <ScorePill score={lead.score} className="[&>span:last-child]:hidden" />
    </Link>
  );
}

const stepTone = {
  risk: { icon: <AlertTriangle />, className: "bg-warning-soft text-warning-text ring-warning-border" },
  action: { icon: <Zap />, className: "bg-primary-soft/60 text-primary ring-primary-border" },
  idea: { icon: <Lightbulb />, className: "bg-accent-soft text-accent ring-accent-border" },
};

function StepsBlock({ items }: Extract<AiBlock, { type: "steps" }>) {
  return (
    <ol className={cn(shell, "divide-y divide-border")}>
      {items.map((item, i) => {
        const tone = stepTone[item.tone ?? "action"];
        return (
          <li key={i} className="flex items-start gap-3 px-3 py-2.5">
            <span className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md ring-1 ring-inset [&_svg]:size-3.5", tone.className)}>
              {tone.icon}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">{item.title}</span>
              <span className="block text-xs text-muted">{item.detail}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function DraftBlock({ subject, body }: Extract<AiBlock, { type: "draft" }>) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked outside secure contexts; the text stays selectable.
    }
  };
  return (
    <div className={shell}>
      <div className="flex items-center gap-2 border-b border-border bg-canvas px-3 py-2">
        <Mail className="size-3.5 text-muted" />
        <span className="min-w-0 flex-1 truncate text-xs text-muted">
          Subject: <span className="font-medium text-ink">{subject}</span>
        </span>
        <Button variant="ghost" size="xs" onClick={copy} leftIcon={copied ? <Check /> : <Copy />}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <p className="whitespace-pre-line px-3 py-3 text-sm leading-relaxed text-ink/90">{body}</p>
    </div>
  );
}

export function MessageBlock({ block, now }: { block: AiBlock; now: number }) {
  switch (block.type) {
    case "leads":
      return <LeadsBlock leadIds={block.leadIds} now={now} />;
    case "deals":
      return <DealsBlock dealIds={block.dealIds} now={now} />;
    case "contact":
      return <ContactBlock leadId={block.leadId} />;
    case "steps":
      return <StepsBlock {...block} />;
    case "draft":
      return <DraftBlock {...block} />;
  }
}
