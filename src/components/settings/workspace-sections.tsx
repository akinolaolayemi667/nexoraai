import { useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Copy, Eye, EyeOff, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { formatDate, formatNumber } from "@/lib/format";
import { useUser } from "@/lib/auth/auth-context";
import { randomKey } from "@/lib/settings/data";
import { integrations, defaultIntegrationState, type IntegrationState } from "@/lib/integrations/catalog";
import { assignableRoles, roleMeta, seatsUsed, useTeam } from "@/lib/team/data";
import { periodTotal, planById, usage, useBilling } from "@/lib/billing/data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useNow } from "@/hooks/use-now";
import { Badge, Button, ConfirmDialog, Input, Progress, Select, Switch, useToast } from "@/components/ui";
import { IntegrationLogo } from "@/components/integrations/integration-logo";
import { RadioCards, SettingRow, SettingsCard, ToggleRow } from "./settings-ui";
import type { SectionProps } from "./account-sections";

function relative(ts: number, now: number) {
  const min = Math.round((now - ts) / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  return hr < 24 ? `${hr} hr ago` : `${Math.floor(hr / 24)} days ago`;
}

export function AiSection({ draft, update }: SectionProps) {
  const a = draft.ai;
  const user = useUser();
  const [billing] = useBilling(user.id, user.email);
  const limit = planById[billing.plan].limits.aiCredits;
  const samples = {
    professional: "Thanks for reaching out. I've attached the pricing breakdown for 40 seats.",
    friendly: "Great question! Here's the pricing for 40 seats — happy to walk you through it.",
    concise: "Pricing for 40 seats attached. Want to set up a quick call?",
  };
  return (
    <>
      <SettingsCard
        title="AI assistant"
        description="Controls for Nexora AI across the inbox, CRM and assistant."
        action={
          <Badge variant={a.enabled ? "success" : "neutral"} size="sm" dot={a.enabled}>
            {a.enabled ? "On" : "Off"}
          </Badge>
        }
      >
        <ToggleRow>
          <Switch checked={a.enabled} onCheckedChange={(v) => update("ai", { enabled: v })} label="Enable AI features" description="Turning this off hides AI summaries, suggestions and the assistant for everyone." />
        </ToggleRow>
        <div className="px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-1.5 font-medium text-ink">
              <Sparkles className="size-3.5 text-accent" aria-hidden />
              AI credits this month
            </span>
            <span className="text-metric text-xs text-muted">
              {formatNumber(usage.aiCredits)} / {Number.isFinite(limit) ? formatNumber(limit) : "Unlimited"}
            </span>
          </div>
          <Progress value={usage.aiCredits} max={Number.isFinite(limit) ? limit : usage.aiCredits * 4} tone="accent" className="mt-2" />
          <Link to={routes.app.billing} className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
            Get more credits
          </Link>
        </div>
      </SettingsCard>

      <fieldset disabled={!a.enabled} className={cn("space-y-4 transition-opacity", !a.enabled && "pointer-events-none opacity-50")}>
        <SettingsCard title="Writing style" description="How AI drafts replies and follow-ups.">
          <SettingRow label="Tone" description="Applied to drafts, summaries and the AI agent." wide>
            <RadioCards
              name="ai-tone"
              value={a.tone}
              onChange={(v) => update("ai", { tone: v })}
              options={[
                { value: "professional", label: "Professional", description: `"${samples.professional}"` },
                { value: "friendly", label: "Friendly", description: `"${samples.friendly}"` },
                { value: "concise", label: "Concise", description: `"${samples.concise}"` },
              ]}
            />
          </SettingRow>
          <SettingRow label="Reply length" htmlFor="ai-length">
            <Select
              id="ai-length"
              value={a.length}
              onChange={(e) => update("ai", { length: e.target.value as typeof a.length })}
              options={[
                { value: "short", label: "Short · 1–2 sentences" },
                { value: "medium", label: "Medium · a short paragraph" },
                { value: "detailed", label: "Detailed · full answer with steps" },
              ]}
            />
          </SettingRow>
        </SettingsCard>

        <SettingsCard title="Automation" description="Where AI is allowed to act on its own.">
          <ToggleRow>
            <Switch checked={a.draftReplies} onCheckedChange={(v) => update("ai", { draftReplies: v })} label="Draft replies in the inbox" description="Show a suggested response for every new customer message." />
          </ToggleRow>
          <ToggleRow>
            <Switch checked={a.summaries} onCheckedChange={(v) => update("ai", { summaries: v })} label="Summarize conversations" description="Keep a live AI summary, intent and sentiment on each thread." />
          </ToggleRow>
          <ToggleRow>
            <Switch checked={a.leadScoring} onCheckedChange={(v) => update("ai", { leadScoring: v })} label="Lead scoring" description="Score leads 0–100 from engagement, fit and deal history." />
          </ToggleRow>
          <ToggleRow>
            <Switch checked={a.nextActions} onCheckedChange={(v) => update("ai", { nextActions: v })} label="Next-best-action suggestions" description="Recommend follow-ups and tasks on leads and deals." />
          </ToggleRow>
          <ToggleRow>
            <Switch
              checked={a.afterHours}
              onCheckedChange={(v) => update("ai", { afterHours: v })}
              label="Auto-reply outside business hours"
              description={`The AI agent answers new chats outside ${draft.workspace.hoursStart}–${draft.workspace.hoursEnd} and hands off to your team in the morning.`}
            />
          </ToggleRow>
          <SettingRow label="Auto-send confidence" description="AI only sends without review above this confidence." htmlFor="ai-confidence">
            <div className="flex items-center gap-3">
              <input
                id="ai-confidence"
                type="range"
                min={50}
                max={99}
                step={1}
                value={a.confidence}
                onChange={(e) => update("ai", { confidence: Number(e.target.value) })}
                className="h-2 min-w-0 flex-1 cursor-pointer accent-primary"
              />
              <span className="text-metric w-12 shrink-0 rounded-sm bg-sunken py-1 text-center text-xs font-semibold text-ink">{a.confidence}%</span>
            </div>
          </SettingRow>
        </SettingsCard>

        <SettingsCard title="Data & privacy" description="What AI can see and how long it's kept.">
          <ToggleRow>
            <Switch checked={a.personalize} onCheckedChange={(v) => update("ai", { personalize: v })} label="Personalize with workspace data" description="Use CRM records, past conversations and deals as context. Never used to train shared models." />
          </ToggleRow>
          <ToggleRow>
            <Switch checked={a.redactPii} onCheckedChange={(v) => update("ai", { redactPii: v })} label="Redact personal data" description="Mask card numbers, government IDs and passwords before AI processing." />
          </ToggleRow>
          <SettingRow label="Keep AI history for" htmlFor="ai-retention">
            <Select
              id="ai-retention"
              value={a.retention}
              onChange={(e) => update("ai", { retention: e.target.value })}
              options={[
                { value: "30", label: "30 days" },
                { value: "90", label: "90 days" },
                { value: "365", label: "1 year" },
                { value: "forever", label: "Until deleted" },
              ]}
              containerClassName="sm:max-w-48"
            />
          </SettingRow>
        </SettingsCard>
      </fieldset>
    </>
  );
}

export function IntegrationsSection({ draft, update, commit, userId }: SectionProps) {
  const { toast } = useToast();
  const now = useNow(60_000);
  const [state] = useLocalStorage<IntegrationState>(`nexora:integrations:v1:${userId}`, defaultIntegrationState(Date.now()));
  const [reveal, setReveal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const connected = integrations.filter((i) => state.connections[i.id]);
  const key = draft.integrations.apiKey;
  const masked = `${key.slice(0, 8)}${"•".repeat(20)}${key.slice(-4)}`;
  const webhookError = draft.integrations.webhookUrl && !/^https:\/\/[^\s]+\.[^\s]+/.test(draft.integrations.webhookUrl) ? "Use an https:// URL" : undefined;

  return (
    <>
      <SettingsCard
        title="Connected apps"
        description={`${connected.length} of ${integrations.filter((i) => !i.comingSoon).length} available integrations connected.`}
        action={
          <Link to={routes.app.integrations} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            Browse marketplace
            <ArrowUpRight className="size-3" aria-hidden />
          </Link>
        }
      >
        {connected.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-muted">Nothing connected yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {connected.map((i) => {
              const c = state.connections[i.id];
              return (
                <li key={i.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <IntegrationLogo id={i.id} name={i.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{i.name}</p>
                    <p className="truncate text-xs text-muted">
                      {c.account} · synced {relative(c.lastSync, now)}
                    </p>
                  </div>
                  <Link to={`${routes.app.integrations}?integration=${i.id}`} className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-ink hover:bg-canvas">
                    Manage
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </SettingsCard>

      <SettingsCard title="API access" description="Use the REST API to sync records with your own systems.">
        <SettingRow label="Secret key" description="Treat it like a password. Demo key — it doesn't work anywhere.">
          <div className="flex gap-2">
            <code className="flex h-9 min-w-0 flex-1 items-center truncate rounded-md border border-border bg-canvas px-3 font-mono text-xs text-ink">{reveal ? key : masked}</code>
            <Button variant="secondary" size="icon" onClick={() => setReveal((v) => !v)} aria-label={reveal ? "Hide key" : "Show key"}>
              {reveal ? <EyeOff /> : <Eye />}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => {
                navigator.clipboard?.writeText(key).catch(() => {});
                toast({ variant: "success", title: "API key copied" });
              }}
              aria-label="Copy key"
            >
              <Copy />
            </Button>
          </div>
          <Button size="xs" variant="ghost" leftIcon={<RefreshCw />} onClick={() => setRegenerating(true)} className="mt-2 -ml-2">
            Regenerate key
          </Button>
        </SettingRow>
        <SettingRow label="Webhook URL" description="We'll POST lead, deal and message events here." htmlFor="int-webhook">
          <Input id="int-webhook" value={draft.integrations.webhookUrl} onChange={(e) => update("integrations", { webhookUrl: e.target.value })} placeholder="https://example.com/webhooks/nexora" error={webhookError} inputMode="url" />
        </SettingRow>
      </SettingsCard>

      <ConfirmDialog
        open={regenerating}
        onClose={() => setRegenerating(false)}
        onConfirm={() => {
          commit("integrations", { apiKey: randomKey() });
          setRegenerating(false);
          setReveal(true);
          toast({ variant: "success", title: "New API key created", description: "The old key stopped working immediately." });
        }}
        tone="danger"
        title="Regenerate API key?"
        description="Apps using the current key will stop syncing until you update them."
        confirmLabel="Regenerate"
      />
    </>
  );
}

export function TeamSection({ draft, update }: SectionProps) {
  const user = useUser();
  const [team] = useTeam(user);
  const [billing] = useBilling(user.id, user.email);
  const t = draft.team;
  const members = team.members;
  const used = seatsUsed(members);
  const pending = members.filter((m) => m.status === "invited").length;
  return (
    <>
      <SettingsCard
        title="Members"
        description={`${members.filter((m) => m.status === "active").length} active · ${pending} pending invite${pending === 1 ? "" : "s"}`}
        action={
          <Link to={routes.app.team} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            Manage members
            <ArrowUpRight className="size-3" aria-hidden />
          </Link>
        }
      >
        <div className="px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink">Seats</span>
            <span className="text-metric text-xs text-muted">
              {used} of {billing.seats} used
            </span>
          </div>
          <Progress value={used} max={billing.seats} tone="auto" className="mt-2" />
        </div>
      </SettingsCard>

      <SettingsCard title="Invitations & access" description="Defaults for new members.">
        <SettingRow label="Default role" description="Pre-selected when someone is invited." htmlFor="team-role">
          <Select
            id="team-role"
            value={t.defaultRole}
            onChange={(e) => update("team", { defaultRole: e.target.value as typeof t.defaultRole })}
            options={assignableRoles.map((r) => ({ value: r.id, label: r.label }))}
            containerClassName="sm:max-w-48"
          />
          <p className="mt-1.5 text-xs text-muted">{roleMeta[t.defaultRole].description}</p>
        </SettingRow>
        <SettingRow label="Allowed email domains" description="Only these domains can be invited. Separate with commas." htmlFor="team-domains">
          <Input id="team-domains" value={t.allowedDomains} onChange={(e) => update("team", { allowedDomains: e.target.value })} placeholder="acme.com, acme.co.uk" />
        </SettingRow>
        <ToggleRow>
          <Switch checked={t.membersCanInvite} onCheckedChange={(v) => update("team", { membersCanInvite: v })} label="Members can invite teammates" description="Otherwise only Owners and Admins can send invites." />
        </ToggleRow>
        <ToggleRow>
          <Switch checked={t.require2fa} onCheckedChange={(v) => update("team", { require2fa: v })} label="Require two-factor authentication" description="Members without 2FA are asked to set it up on their next sign-in." />
        </ToggleRow>
      </SettingsCard>
    </>
  );
}

export function BillingSection({ draft, update }: SectionProps) {
  const user = useUser();
  const [billing] = useBilling(user.id, user.email);
  const plan = planById[billing.plan];
  const b = draft.billing;
  const emailError = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(b.billingEmail) ? "Enter a valid email" : undefined;
  return (
    <>
      <SettingsCard
        title="Subscription"
        description="Demo billing — no real charges."
        action={
          <Link to={routes.app.billing} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            Open billing
            <ArrowUpRight className="size-3" aria-hidden />
          </Link>
        }
      >
        <dl className="grid grid-cols-2 gap-4 px-4 py-4 text-sm sm:px-5 md:grid-cols-4">
          <div>
            <dt className="text-xs text-muted">Plan</dt>
            <dd className="mt-0.5 font-medium text-ink">{plan.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Billing</dt>
            <dd className="mt-0.5 font-medium capitalize text-ink">{billing.cycle}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{billing.cancelAtPeriodEnd ? "Ends" : "Next invoice"}</dt>
            <dd className="mt-0.5 font-medium text-ink">{formatDate(billing.periodEnd)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Amount</dt>
            <dd className="text-metric mt-0.5 font-medium text-ink">${formatNumber(periodTotal(billing.plan, billing.cycle, billing.seats))}</dd>
          </div>
        </dl>
      </SettingsCard>

      <SettingsCard title="Invoices" description="Where receipts go and what's printed on them.">
        <SettingRow label="Billing email" htmlFor="bill-email">
          <Input id="bill-email" type="email" value={b.billingEmail} onChange={(e) => update("billing", { billingEmail: e.target.value })} error={emailError} autoComplete="email" />
        </SettingRow>
        <SettingRow label="Tax ID" description="VAT, GST or EIN. Optional." htmlFor="bill-tax">
          <Input id="bill-tax" value={b.taxId} onChange={(e) => update("billing", { taxId: e.target.value.toUpperCase() })} placeholder="e.g. GB123456789" />
        </SettingRow>
        <ToggleRow>
          <Switch checked={b.invoiceEmails} onCheckedChange={(v) => update("billing", { invoiceEmails: v })} label="Email invoices" description="Send a PDF receipt to the billing email after each payment." />
        </ToggleRow>
      </SettingsCard>
    </>
  );
}
