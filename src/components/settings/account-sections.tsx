import { useState } from "react";
import { Link } from "react-router";
import { Check, KeyRound, Laptop, Lock, LogOut, Smartphone, Upload } from "lucide-react";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { channels, notificationEvents, timezones, type Channel, type Settings } from "@/lib/settings/data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Alert, Avatar, Badge, Button, ConfirmDialog, Input, Modal, Select, Switch, useToast } from "@/components/ui";
import { RadioCards, SettingRow, SettingsCard, ToggleRow } from "./settings-ui";

export type SectionKey = Exclude<keyof Settings, "version">;
export type SectionProps = {
  draft: Settings;
  update: <K extends SectionKey>(key: K, patch: Partial<Settings[K]>) => void;
  commit: <K extends SectionKey>(key: K, patch: Partial<Settings[K]>) => void;
  userId: string;
  email: string;
};

const tzLabel = (tz: string) => {
  try {
    const offset = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value ?? "";
    return `${tz.replace(/_/g, " ").split("/").pop()} (${offset.replace("GMT", "UTC")})`;
  } catch {
    return tz;
  }
};

export function GeneralSection({ draft, update, email }: SectionProps) {
  const { toast } = useToast();
  const g = draft.general;
  const zones = timezones.includes(g.timezone) ? timezones : [g.timezone, ...timezones];
  const sample = new Date(2026, 8, 26);
  const fmt = { mdy: "09/26/2026", dmy: "26/09/2026", ymd: "2026-09-26" };
  return (
    <>
      <SettingsCard title="Profile" description="How you appear to teammates and customers.">
        <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
          <Avatar name={g.name || "?"} size="xl" />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" leftIcon={<Upload />} onClick={() => toast({ title: "Photo uploads arrive with the backend", description: "Demo: your initials are used for now." })}>
              Upload photo
            </Button>
            <p className="w-full text-xs text-muted">PNG or JPG, at least 256×256px.</p>
          </div>
        </div>
        <SettingRow label="Full name" htmlFor="s-name">
          <Input id="s-name" value={g.name} onChange={(e) => update("general", { name: e.target.value })} error={g.name.trim().length < 2 ? "Enter your name" : undefined} autoComplete="name" />
        </SettingRow>
        <SettingRow label="Email" description="Used to sign in. Contact support to change it." htmlFor="s-email">
          <Input id="s-email" value={email} readOnly disabled />
        </SettingRow>
        <SettingRow label="Job title" htmlFor="s-title">
          <Input id="s-title" value={g.title} onChange={(e) => update("general", { title: e.target.value })} placeholder="e.g. Head of Sales" />
        </SettingRow>
        <SettingRow label="Phone" description="Optional. Shown on your email signature." htmlFor="s-phone">
          <Input id="s-phone" value={g.phone} onChange={(e) => update("general", { phone: e.target.value })} placeholder="+1 (555) 000-0000" inputMode="tel" autoComplete="tel" />
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Preferences" description="Language, time and date formatting across the app.">
        <SettingRow label="Time zone" description="Used for due dates, reports and quiet hours." htmlFor="s-tz">
          <Select id="s-tz" value={g.timezone} onChange={(e) => update("general", { timezone: e.target.value })} options={zones.map((tz) => ({ value: tz, label: tzLabel(tz) }))} />
        </SettingRow>
        <SettingRow label="Language" htmlFor="s-lang">
          <Select
            id="s-lang"
            value={g.language}
            onChange={(e) => update("general", { language: e.target.value })}
            options={[
              { value: "en-US", label: "English (US)" },
              { value: "en-GB", label: "English (UK)" },
              { value: "fr-FR", label: "Français" },
              { value: "es-ES", label: "Español" },
              { value: "de-DE", label: "Deutsch" },
              { value: "pt-BR", label: "Português (Brasil)" },
            ]}
          />
        </SettingRow>
        <SettingRow label="Date format" wide>
          <RadioCards
            name="date-format"
            value={g.dateFormat}
            onChange={(v) => update("general", { dateFormat: v })}
            options={[
              { value: "mdy", label: "MM/DD/YYYY", description: fmt.mdy },
              { value: "dmy", label: "DD/MM/YYYY", description: fmt.dmy },
              { value: "ymd", label: "YYYY-MM-DD", description: fmt.ymd },
            ]}
          />
          <span className="sr-only">{sample.toDateString()}</span>
        </SettingRow>
        <SettingRow label="Week starts on" htmlFor="s-week">
          <Select
            id="s-week"
            value={g.weekStart}
            onChange={(e) => update("general", { weekStart: e.target.value as "monday" | "sunday" })}
            options={[
              { value: "monday", label: "Monday" },
              { value: "sunday", label: "Sunday" },
            ]}
            containerClassName="sm:max-w-48"
          />
        </SettingRow>
      </SettingsCard>
    </>
  );
}

export function WorkspaceSection({ draft, update }: SectionProps) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const w = draft.workspace;
  return (
    <>
      <SettingsCard title="Workspace details" description="Shared by everyone in this workspace.">
        <SettingRow label="Workspace name" htmlFor="w-name">
          <Input id="w-name" value={w.name} onChange={(e) => update("workspace", { name: e.target.value })} error={w.name.trim().length < 2 ? "Enter a workspace name" : undefined} />
        </SettingRow>
        <SettingRow label="Workspace URL" description="Where your team signs in." htmlFor="w-slug">
          <div className="flex rounded-md shadow-xs">
            <span className="flex items-center rounded-l-md border border-r-0 border-border-strong bg-canvas px-3 text-sm text-muted">nexora.ai/</span>
            <input
              id="w-slug"
              value={w.slug}
              onChange={(e) => update("workspace", { slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
              className="h-9 min-w-0 flex-1 rounded-r-md border border-border-strong bg-white px-3 text-sm text-ink outline-none focus:border-primary focus:shadow-focus"
            />
          </div>
        </SettingRow>
        <SettingRow label="Industry" htmlFor="w-industry">
          <Select
            id="w-industry"
            value={w.industry}
            onChange={(e) => update("workspace", { industry: e.target.value })}
            options={[
              { value: "software", label: "Software & SaaS" },
              { value: "agency", label: "Agency & services" },
              { value: "ecommerce", label: "E-commerce & retail" },
              { value: "health", label: "Healthcare" },
              { value: "finance", label: "Financial services" },
              { value: "realestate", label: "Real estate" },
              { value: "other", label: "Other" },
            ]}
          />
        </SettingRow>
        <SettingRow label="Company size" htmlFor="w-size">
          <Select
            id="w-size"
            value={w.size}
            onChange={(e) => update("workspace", { size: e.target.value })}
            options={["1-10", "11-50", "51-200", "201-1000", "1000+"].map((s) => ({ value: s, label: `${s} employees` }))}
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Regional & business hours" description="Defaults for money, reporting periods and AI after-hours replies.">
        <SettingRow label="Currency" htmlFor="w-currency">
          <Select
            id="w-currency"
            value={w.currency}
            onChange={(e) => update("workspace", { currency: e.target.value })}
            options={[
              { value: "USD", label: "US Dollar (USD)" },
              { value: "EUR", label: "Euro (EUR)" },
              { value: "GBP", label: "British Pound (GBP)" },
              { value: "NGN", label: "Nigerian Naira (NGN)" },
              { value: "CAD", label: "Canadian Dollar (CAD)" },
              { value: "AUD", label: "Australian Dollar (AUD)" },
            ]}
          />
        </SettingRow>
        <SettingRow label="Fiscal year starts" htmlFor="w-fiscal">
          <Select
            id="w-fiscal"
            value={w.fiscalStart}
            onChange={(e) => update("workspace", { fiscalStart: e.target.value })}
            options={["january", "april", "july", "october"].map((m) => ({ value: m, label: m[0].toUpperCase() + m.slice(1) }))}
          />
        </SettingRow>
        <SettingRow label="Business hours" description="Monday to Friday, in your workspace time zone.">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:max-w-72">
            <Input type="time" value={w.hoursStart} onChange={(e) => update("workspace", { hoursStart: e.target.value })} aria-label="Opens at" />
            <span className="text-sm text-muted">to</span>
            <Input type="time" value={w.hoursEnd} onChange={(e) => update("workspace", { hoursEnd: e.target.value })} aria-label="Closes at" />
          </div>
        </SettingRow>
      </SettingsCard>

      <section className="rounded-lg border border-danger/30 bg-white shadow-xs">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h3 className="text-sm font-semibold text-danger-text">Delete workspace</h3>
            <p className="mt-0.5 text-sm text-muted">Permanently remove all leads, deals, conversations and automations.</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setDeleting(true)} className="shrink-0">
            Delete workspace
          </Button>
        </div>
      </section>
      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={() => {
          setDeleting(false);
          toast({ variant: "info", title: "Nothing was deleted", description: "Workspace deletion is disabled in this demo." });
        }}
        tone="danger"
        title={`Delete ${w.name}?`}
        description="Everything in this workspace would be permanently erased for every member. In this demo, nothing is actually deleted."
        confirmLabel="Delete workspace"
      />
    </>
  );
}

export function NotificationsSection({ draft, update }: SectionProps) {
  const n = draft.notifications;
  const toggle = (event: string, channel: Channel) => update("notifications", { matrix: { ...n.matrix, [event]: { ...n.matrix[event], [channel]: !n.matrix[event]?.[channel] } } });
  const setColumn = (channel: Channel, value: boolean) =>
    update("notifications", { matrix: Object.fromEntries(Object.entries(n.matrix).map(([id, row]) => [id, { ...row, [channel]: value }])) });
  const columnAll = (channel: Channel) => notificationEvents.every((e) => n.matrix[e.id]?.[channel]);

  return (
    <>
      <SettingsCard title="What you're notified about" description="Choose a channel for each event.">
        <table className="hidden w-full text-sm md:table">
          <thead className="bg-canvas text-xs text-muted">
            <tr>
              <th scope="col" className="px-5 py-2.5 text-left font-medium">
                Event
              </th>
              {channels.map((c) => (
                <th key={c.id} scope="col" className="w-24 px-2 py-2.5 text-center font-medium">
                  <button type="button" onClick={() => setColumn(c.id, !columnAll(c.id))} className="rounded-xs hover:text-ink" title={columnAll(c.id) ? `Turn off all ${c.label}` : `Turn on all ${c.label}`}>
                    {c.label}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {notificationEvents.map((e) => (
              <tr key={e.id}>
                <td className="px-5 py-3">
                  <p className="font-medium text-ink">{e.label}</p>
                  <p className="text-xs text-muted">{e.description}</p>
                </td>
                {channels.map((c) => (
                  <td key={c.id} className="px-2 py-3 text-center">
                    <Switch size="sm" checked={Boolean(n.matrix[e.id]?.[c.id])} onCheckedChange={() => toggle(e.id, c.id)} aria-label={`${e.label} by ${c.label}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="divide-y divide-border md:hidden">
          {notificationEvents.map((e) => (
            <li key={e.id} className="px-4 py-3.5">
              <p className="text-sm font-medium text-ink">{e.label}</p>
              <p className="text-xs text-muted">{e.description}</p>
              <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                {channels.map((c) => {
                  const active = Boolean(n.matrix[e.id]?.[c.id]);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggle(e.id, c.id)}
                      className={cn(
                        "flex h-9 items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors",
                        active ? "border-primary-border bg-primary-soft text-primary-active" : "border-border text-muted",
                      )}
                    >
                      {active && <Check className="size-3.5" aria-hidden />}
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </SettingsCard>

      <SettingsCard title="Delivery" description="Batch emails and pause alerts outside work.">
        <SettingRow label="Email digest" description="Bundle non-urgent emails into one." wide>
          <RadioCards
            name="digest"
            value={n.digest}
            onChange={(v) => update("notifications", { digest: v })}
            options={[
              { value: "daily", label: "Daily", description: "8:00 AM" },
              { value: "weekly", label: "Weekly", description: "Monday 8:00 AM" },
              { value: "off", label: "Off", description: "Send each one" },
            ]}
          />
        </SettingRow>
        <ToggleRow>
          <Switch checked={n.quietHours} onCheckedChange={(v) => update("notifications", { quietHours: v })} label="Quiet hours" description="Mute push notifications overnight. Urgent security alerts still come through." />
          {n.quietHours && (
            <div className="mt-3 grid max-w-72 grid-cols-[1fr_auto_1fr] items-center gap-2">
              <Input type="time" size="sm" value={n.quietStart} onChange={(e) => update("notifications", { quietStart: e.target.value })} aria-label="Quiet hours start" />
              <span className="text-sm text-muted">to</span>
              <Input type="time" size="sm" value={n.quietEnd} onChange={(e) => update("notifications", { quietEnd: e.target.value })} aria-label="Quiet hours end" />
            </div>
          )}
        </ToggleRow>
      </SettingsCard>
    </>
  );
}

function strength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(4, score);
}

const strengthMeta = [
  { label: "Too weak", tone: "bg-danger" },
  { label: "Weak", tone: "bg-danger" },
  { label: "Fair", tone: "bg-warning" },
  { label: "Good", tone: "bg-success" },
  { label: "Strong", tone: "bg-success" },
];

function PasswordCard() {
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const score = strength(next);
  const errors = {
    current: current.length === 0 ? "Enter your current password" : null,
    next: next.length < 8 ? "Use at least 8 characters" : score < 2 ? "Add numbers, symbols or mixed case" : null,
    confirm: confirm !== next ? "Passwords don't match" : null,
  };

  async function submit() {
    setTouched(true);
    if (Object.values(errors).some(Boolean)) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setCurrent("");
    setNext("");
    setConfirm("");
    setTouched(false);
    toast({ variant: "success", title: "Password updated", description: "Demo: other sessions would be signed out." });
  }

  return (
    <SettingsCard
      title="Password"
      description="Use at least 8 characters with a mix of letters, numbers and symbols."
      footer={
        <Button size="sm" leftIcon={<KeyRound />} onClick={submit} loading={saving} loadingText="Updating…">
          Update password
        </Button>
      }
    >
      <form
        className="grid gap-4 px-4 py-4 sm:px-5 md:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Input label="Current password" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" error={touched ? errors.current : undefined} />
        <div>
          <Input label="New password" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" error={touched ? errors.next : undefined} />
          {next && (
            <div className="mt-2">
              <div className="grid grid-cols-4 gap-1" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={cn("h-1 rounded-full", i < score ? strengthMeta[score].tone : "bg-sunken")} />
                ))}
              </div>
              <p className="mt-1 text-xs text-muted">Strength: {strengthMeta[score].label}</p>
            </div>
          )}
        </div>
        <Input label="Confirm new password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" error={touched ? errors.confirm : undefined} />
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </SettingsCard>
  );
}

function QrMock() {
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21;
    const y = Math.floor(i / 21);
    const finder = (cx: number, cy: number) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7 && (x === cx || x === cx + 6 || y === cy || y === cy + 6 || (x >= cx + 2 && x <= cx + 4 && y >= cy + 2 && y <= cy + 4));
    const inFinder = (cx: number, cy: number) => x >= cx && x < cx + 8 && y >= cy && y < cy + 8;
    if (inFinder(0, 0) || inFinder(13, 0) || inFinder(0, 13)) return finder(0, 0) || finder(14, 0) || finder(0, 14);
    return ((x * 7 + y * 13 + x * y) % 5) < 2;
  });
  return (
    <svg viewBox="0 0 21 21" className="size-36 rounded-md border border-border bg-white p-2" role="img" aria-label="QR code for your authenticator app (demo)" shapeRendering="crispEdges">
      {cells.map((on, i) => (on ? <rect key={i} x={i % 21} y={Math.floor(i / 21)} width="1" height="1" fill="#0f172a" /> : null))}
    </svg>
  );
}

function TwoFactorModal({ open, onClose, onEnable }: { open: boolean; onClose: () => void; onEnable: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  async function verify() {
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your app");
      return;
    }
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 900));
    setVerifying(false);
    setCode("");
    onEnable();
  }

  return (
    <Modal open={open} onClose={onClose} title="Set up two-factor authentication" description="Scan the code with Google Authenticator, 1Password or Authy." size="md">
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <QrMock />
          <div className="min-w-0 space-y-2 text-sm text-muted">
            <p>Can't scan? Enter this key manually:</p>
            <code className="block break-all rounded-md bg-sunken px-2.5 py-1.5 font-mono text-xs text-ink">NXRA 7K2P QW9L M4TD</code>
            <p className="text-xs">Demo: any 6 digits will verify.</p>
          </div>
        </div>
        <Input
          label="Verification code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
            setError(null);
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          error={error ?? undefined}
          className="text-metric tracking-[0.3em]"
          data-autofocus
        />
        <div className="sticky -bottom-5 -mx-6 -mb-5 flex flex-col-reverse gap-2 border-t border-border bg-canvas px-6 py-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={verifying}>
            Cancel
          </Button>
          <Button onClick={verify} loading={verifying} loadingText="Verifying…">
            Verify & enable
          </Button>
        </div>
      </div>
    </Modal>
  );
}

type Session = { id: string; device: string; kind: "desktop" | "mobile"; location: string; lastActive: string; current?: boolean };

function thisDevice(): string {
  const ua = typeof navigator === "undefined" ? "" : navigator.userAgent;
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : "Unknown OS";
  return `${browser} on ${os}`;
}

export function SecuritySection({ draft, update, commit, userId }: SectionProps) {
  const { toast } = useToast();
  const s = draft.security;
  const [setup, setSetup] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [sessions, setSessions] = useLocalStorage<Session[]>(`nexora:sessions:${userId}`, [
    { id: "s_current", device: thisDevice(), kind: "desktop", location: "Current location", lastActive: "Active now", current: true },
    { id: "s_iphone", device: "Safari on iPhone 15", kind: "mobile", location: "Lagos, Nigeria", lastActive: "2 hours ago" },
    { id: "s_mac", device: "Chrome on macOS", kind: "desktop", location: "London, United Kingdom", lastActive: "3 days ago" },
  ]);
  const others = sessions.filter((x) => !x.current);

  return (
    <>
      <PasswordCard />

      <SettingsCard
        title="Two-factor authentication"
        description="Require a code from your phone when signing in."
        action={
          <Badge variant={s.twoFactor ? "success" : "neutral"} dot={s.twoFactor} size="sm">
            {s.twoFactor ? "Enabled" : "Off"}
          </Badge>
        }
      >
        <ToggleRow>
          <Switch
            checked={s.twoFactor}
            onCheckedChange={(v) => (v ? setSetup(true) : setDisabling(true))}
            label="Authenticator app"
            description={s.twoFactor ? "You'll be asked for a 6-digit code on new devices." : "Recommended for every account with access to customer data."}
          />
        </ToggleRow>
      </SettingsCard>

      <SettingsCard title="Sign-in" description="Session length and alerts.">
        <SettingRow label="Sign out after" description="Inactive sessions end automatically." htmlFor="sec-timeout">
          <Select
            id="sec-timeout"
            value={s.sessionTimeout}
            onChange={(e) => update("security", { sessionTimeout: e.target.value })}
            options={[
              { value: "1h", label: "1 hour" },
              { value: "8h", label: "8 hours" },
              { value: "24h", label: "24 hours" },
              { value: "7d", label: "7 days" },
              { value: "30d", label: "30 days" },
            ]}
            containerClassName="sm:max-w-48"
          />
        </SettingRow>
        <ToggleRow>
          <Switch checked={s.loginAlerts} onCheckedChange={(v) => update("security", { loginAlerts: v })} label="New sign-in alerts" description="Email me when my account is used on a new device." />
        </ToggleRow>
      </SettingsCard>

      <SettingsCard
        title="Active sessions"
        description="Devices signed in to your account."
        footer={
          others.length > 0 ? (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<LogOut />}
              onClick={() => {
                setSessions((list) => list.filter((x) => x.current));
                toast({ variant: "success", title: "Signed out other sessions", description: `${others.length} device${others.length === 1 ? "" : "s"} signed out.` });
              }}
            >
              Sign out other sessions
            </Button>
          ) : undefined
        }
      >
        <ul className="divide-y divide-border">
          {sessions.map((x) => (
            <li key={x.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sunken text-muted">{x.kind === "mobile" ? <Smartphone className="size-4" /> : <Laptop className="size-4" />}</span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-ink">
                  <span className="truncate">{x.device}</span>
                  {x.current && (
                    <Badge variant="success" size="sm">
                      This device
                    </Badge>
                  )}
                </p>
                <p className="truncate text-xs text-muted">
                  {x.location} · {x.lastActive}
                </p>
              </div>
              {!x.current && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setSessions((list) => list.filter((y) => y.id !== x.id));
                    toast({ variant: "success", title: "Session revoked", description: x.device });
                  }}
                >
                  Revoke
                </Button>
              )}
            </li>
          ))}
        </ul>
      </SettingsCard>

      <SettingsCard
        title="Single sign-on (SSO)"
        description="Sign in with Okta, Azure AD or Google Workspace and provision users with SCIM."
        action={
          <Badge variant="accent" size="sm">
            <Lock className="size-3" aria-hidden />
            Enterprise
          </Badge>
        }
      >
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm text-muted">Available on the Enterprise plan.</p>
          <Link to={routes.app.billing} className="text-sm font-medium text-primary hover:underline">
            Compare plans
          </Link>
        </div>
      </SettingsCard>

      <TwoFactorModal
        open={setup}
        onClose={() => setSetup(false)}
        onEnable={() => {
          commit("security", { twoFactor: true });
          setSetup(false);
          toast({ variant: "success", title: "Two-factor authentication enabled", description: "Save your recovery codes somewhere safe. (Demo)" });
        }}
      />
      <ConfirmDialog
        open={disabling}
        onClose={() => setDisabling(false)}
        onConfirm={() => {
          commit("security", { twoFactor: false });
          setDisabling(false);
          toast({ variant: "warning", title: "Two-factor authentication turned off" });
        }}
        tone="danger"
        title="Turn off two-factor authentication?"
        description="Your account will be protected by your password only."
        confirmLabel="Turn off"
      />
      {!s.twoFactor && draft.team.require2fa && <Alert tone="warning" title="Your workspace requires 2FA" description="Turn on two-factor authentication to keep access." />}
    </>
  );
}
