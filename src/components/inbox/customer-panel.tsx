import type { ReactNode } from "react";
import { Building2, CalendarDays, CreditCard, Mail, MapPin, Phone, RefreshCw, Sparkles, TrendingUp, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDate } from "@/lib/format";
import { ownerById } from "@/lib/crm/constants";
import type { InboxConversation, InboxSummary } from "@/lib/inbox/data";
import { Avatar, Badge, Button } from "@/components/ui";

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5 text-sm">
      <span className="mt-0.5 text-subtle [&_svg]:size-3.5" aria-hidden>
        {icon}
      </span>
      <span className="w-24 shrink-0 text-muted">{label}</span>
      <span className="min-w-0 flex-1 break-words text-ink">{children}</span>
    </div>
  );
}

export function CustomerDetails({ conversation: c }: { conversation: InboxConversation }) {
  const { customer } = c;
  const assignee = c.assigneeId ? ownerById(c.assigneeId).name : "Unassigned";
  return (
    <section aria-labelledby={`${c.id}-customer`}>
      <h3 id={`${c.id}-customer`} className="type-overline">
        Customer
      </h3>
      <div className="mt-3 flex items-center gap-3">
        <Avatar name={customer.name} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{customer.name}</p>
          <p className="truncate text-xs text-muted">
            {customer.title} · {customer.company}
          </p>
        </div>
      </div>
      {customer.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {customer.tags.map((t) => (
            <Badge key={t} size="sm" variant="neutral">
              {t}
            </Badge>
          ))}
        </div>
      )}
      <div className="mt-3 divide-y divide-border/60">
        <Row icon={<Mail />} label="Email">
          <a href={`mailto:${customer.email}`} title={customer.email} className="block truncate text-primary hover:underline">
            {customer.email}
          </a>
        </Row>
        <Row icon={<Phone />} label="Phone">
          {customer.phone}
        </Row>
        <Row icon={<MapPin />} label="Location">
          {customer.location}
        </Row>
        <Row icon={<Building2 />} label="Company">
          {customer.company}
        </Row>
        <Row icon={<CreditCard />} label="Plan">
          {customer.plan}
        </Row>
        <Row icon={<TrendingUp />} label="MRR">
          {customer.mrr > 0 ? `${formatCurrency(customer.mrr)}/mo` : <span className="text-subtle">Prospect</span>}
        </Row>
        <Row icon={<CalendarDays />} label="Customer since">
          {customer.customerSince ? formatDate(customer.customerSince) : <span className="text-subtle">Not a customer yet</span>}
        </Row>
        <Row icon={<UserRound />} label="Assigned to">
          {assignee}
        </Row>
      </div>
    </section>
  );
}

const sentimentMeta: Record<InboxSummary["sentiment"], { label: string; variant: "success" | "neutral" | "danger" }> = {
  positive: { label: "Positive", variant: "success" },
  neutral: { label: "Neutral", variant: "neutral" },
  negative: { label: "Needs care", variant: "danger" },
};

type AiSummaryProps = {
  conversation: InboxConversation;
  suggestion: string;
  suggestionIndex: number;
  busy: boolean;
  onGenerate: () => void;
  onNextSuggestion: () => void;
  className?: string;
};

export function AiSummaryCard({ conversation: c, suggestion, suggestionIndex, busy, onGenerate, onNextSuggestion, className }: AiSummaryProps) {
  const { summary } = c;
  const sentiment = sentimentMeta[summary.sentiment];
  const total = summary.suggestions.length;

  return (
    <section
      aria-labelledby={`${c.id}-summary`}
      className={cn("rounded-lg border border-primary-border bg-gradient-to-br from-primary-soft/50 via-white to-accent-soft/60 p-4", className)}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-primary text-white">
          <Sparkles className="size-3.5" aria-hidden />
        </span>
        <h3 id={`${c.id}-summary`} className="text-sm font-semibold text-ink">
          AI Summary
        </h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink">{summary.text}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge size="sm" variant="primary">
          Intent: {summary.intent}
        </Badge>
        <Badge size="sm" variant={sentiment.variant} dot>
          {sentiment.label}
        </Badge>
      </div>
      {summary.points.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {summary.points.map((p) => (
            <li key={p} className="flex gap-2 text-xs leading-relaxed text-muted">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 rounded-md border border-border bg-white/85 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="type-overline">Suggested response</p>
          {total > 1 && (
            <span className="font-mono text-2xs text-subtle">
              {suggestionIndex + 1}/{total}
            </span>
          )}
        </div>
        <p className="mt-1.5 line-clamp-4 whitespace-pre-line text-xs leading-relaxed text-ink/80">{suggestion}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" leftIcon={<Sparkles />} onClick={onGenerate} disabled={busy} className="flex-1">
            Generate response
          </Button>
          {total > 1 && (
            <Button size="sm" variant="secondary" leftIcon={<RefreshCw />} onClick={onNextSuggestion} disabled={busy} aria-label="Show another suggested response">
              Another
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
