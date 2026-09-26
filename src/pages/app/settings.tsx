import { useState, type ComponentType } from "react";
import { useSearchParams } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Blocks, Building2, ChevronLeft, ChevronRight, CreditCard, Shield, Sparkles, UserRound, UsersRound, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth, useUser } from "@/lib/auth/auth-context";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useBilling } from "@/lib/billing/data";
import { SETTINGS_VERSION, defaultSettings, type SectionId, type Settings } from "@/lib/settings/data";
import { Button, useToast } from "@/components/ui";
import { GeneralSection, NotificationsSection, SecuritySection, WorkspaceSection, type SectionKey, type SectionProps } from "@/components/settings/account-sections";
import { AiSection, BillingSection, IntegrationsSection, TeamSection } from "@/components/settings/workspace-sections";

type SectionMeta = { id: SectionId; label: string; description: string; icon: LucideIcon; group: "Account" | "Workspace"; component: ComponentType<SectionProps> };

const sections: SectionMeta[] = [
  { id: "general", label: "General", description: "Profile, language and time zone", icon: UserRound, group: "Account", component: GeneralSection },
  { id: "notifications", label: "Notifications", description: "Email, push and in-app alerts", icon: Bell, group: "Account", component: NotificationsSection },
  { id: "security", label: "Security", description: "Password, 2FA and sessions", icon: Shield, group: "Account", component: SecuritySection },
  { id: "workspace", label: "Workspace", description: "Name, URL, currency and hours", icon: Building2, group: "Workspace", component: WorkspaceSection },
  { id: "ai", label: "AI Preferences", description: "Tone, automation and privacy", icon: Sparkles, group: "Workspace", component: AiSection },
  { id: "integrations", label: "Integrations", description: "Connected apps and API keys", icon: Blocks, group: "Workspace", component: IntegrationsSection },
  { id: "team", label: "Team", description: "Invites, roles and access rules", icon: UsersRound, group: "Workspace", component: TeamSection },
  { id: "billing", label: "Billing", description: "Plan summary and invoice details", icon: CreditCard, group: "Workspace", component: BillingSection },
];

const groups = ["Account", "Workspace"] as const;

function validate(s: Settings) {
  const errors: { section: SectionId; message: string }[] = [];
  if (s.general.name.trim().length < 2) errors.push({ section: "general", message: "Enter your name" });
  if (s.workspace.name.trim().length < 2) errors.push({ section: "workspace", message: "Enter a workspace name" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.billing.billingEmail)) errors.push({ section: "billing", message: "Enter a valid billing email" });
  if (s.integrations.webhookUrl && !/^https:\/\/[^\s]+\.[^\s]+/.test(s.integrations.webhookUrl)) errors.push({ section: "integrations", message: "Webhook URL must start with https://" });
  return errors;
}

export default function SettingsPage() {
  const user = useUser();
  const { updateProfile } = useAuth();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [saved, setSaved] = useLocalStorage<Settings>(`nexora:settings:v${SETTINGS_VERSION}:${user.id}`, defaultSettings(user));
  const [draft, setDraft] = useState<Settings>(saved);
  const [saving, setSaving] = useState(false);
  const [, setBilling] = useBilling(user.id, user.email);

  const param = params.get("section") as SectionId | null;
  const requested = sections.find((s) => s.id === param) ?? null;
  const active = requested ?? sections[0];
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const dirtySections = new Set(
    (Object.keys(draft) as (keyof Settings)[]).filter((k) => k !== "version" && JSON.stringify(draft[k]) !== JSON.stringify(saved[k])).map((k) => k as SectionId),
  );

  const update: SectionProps["update"] = (key, patch) => setDraft((d) => ({ ...d, [key]: { ...d[key], ...patch } }));
  const commit: SectionProps["commit"] = <K extends SectionKey>(key: K, patch: Partial<Settings[K]>) => {
    update(key, patch);
    setSaved((s) => ({ ...s, [key]: { ...s[key], ...patch } }));
  };

  function go(id: SectionId | null) {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (id) next.set("section", id);
      else next.delete("section");
      return next;
    });
    window.scrollTo({ top: 0 });
  }

  async function save() {
    const errors = validate(draft);
    if (errors.length) {
      go(errors[0].section);
      toast({ variant: "error", title: "Check the highlighted fields", description: errors.map((e) => e.message).join(" · ") });
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaved(draft);
    const profile: { name?: string; company?: string } = {};
    if (draft.general.name.trim() !== user.name) profile.name = draft.general.name.trim();
    if (draft.workspace.name.trim() !== user.company) profile.company = draft.workspace.name.trim();
    if (profile.name || profile.company) updateProfile(profile);
    if (draft.billing.billingEmail !== saved.billing.billingEmail) setBilling((b) => ({ ...b, billingEmail: draft.billing.billingEmail }));
    setSaving(false);
    toast({ variant: "success", title: "Settings saved" });
  }

  const Section = active.component;
  const sectionProps: SectionProps = { draft, update, commit, userId: user.id, email: user.email };

  return (
    <>
      <title>{`${requested ? `${requested.label} · ` : ""}Settings · NEXORA AI`}</title>

      <header className={cn("flex flex-col gap-1", requested && "max-md:hidden")}>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Settings</h1>
        <p className="text-base text-muted">Manage your account and {user.company}'s workspace.</p>
      </header>

      {/* Mobile: section index */}
      {!requested && (
        <nav aria-label="Settings sections" className="mt-5 space-y-5 md:hidden">
          {groups.map((g) => (
            <div key={g}>
              <p className="type-overline mb-2 px-1">{g}</p>
              <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-white shadow-xs">
                {sections
                  .filter((s) => s.group === g)
                  .map((s) => (
                    <li key={s.id}>
                      <button type="button" onClick={() => go(s.id)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-canvas">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sunken text-muted">
                          <s.icon className="size-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 text-sm font-medium text-ink">
                            {s.label}
                            {dirtySections.has(s.id) && <span className="size-1.5 rounded-full bg-warning" aria-label="Unsaved changes" />}
                          </span>
                          <span className="block truncate text-xs text-muted">{s.description}</span>
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-subtle" aria-hidden />
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>
      )}

      {/* Tablet: horizontal section tabs */}
      <nav aria-label="Settings sections" className="scrollbar-none -mx-6 mt-5 hidden overflow-x-auto border-b border-border px-6 md:block lg:hidden">
        <ul className="flex gap-1">
          {sections.map((s) => {
            const current = s.id === active.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => go(s.id)}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "relative flex h-10 items-center gap-1.5 whitespace-nowrap px-2.5 text-sm font-medium transition-colors",
                    current ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  <s.icon className={cn("size-4", current ? "text-primary" : "text-subtle")} aria-hidden />
                  {s.label}
                  {dirtySections.has(s.id) && <span className="size-1.5 rounded-full bg-warning" aria-label="Unsaved changes" />}
                  {current && <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={cn("mt-6 gap-8 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)]", !requested && "max-md:hidden")}>
        <nav aria-label="Settings sections" className="hidden lg:block">
          <div className="sticky top-[calc(var(--spacing-topbar)+1.5rem)] space-y-5">
            {groups.map((g) => (
              <div key={g}>
                <p className="type-overline mb-1.5 px-2.5">{g}</p>
                <ul className="space-y-0.5">
                  {sections
                    .filter((s) => s.group === g)
                    .map((s) => {
                      const current = s.id === active.id;
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => go(s.id)}
                            aria-current={current ? "page" : undefined}
                            className={cn(
                              "flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-sm font-medium outline-none transition-colors focus-visible:shadow-focus",
                              current ? "bg-white text-ink shadow-xs ring-1 ring-border" : "text-muted hover:bg-canvas hover:text-ink",
                            )}
                          >
                            <s.icon className={cn("size-4 shrink-0", current ? "text-primary" : "text-subtle")} aria-hidden />
                            <span className="flex-1 truncate">{s.label}</span>
                            {dirtySections.has(s.id) && <span className="size-1.5 rounded-full bg-warning" aria-label="Unsaved changes" />}
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="min-w-0 max-w-4xl">
          <div className="mb-4 flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="icon-sm" onClick={() => go(null)} aria-label="Back to settings" className="-ml-2">
              <ChevronLeft />
            </Button>
            <div className="min-w-0">
              <p className="text-xs text-muted">Settings</p>
              <h1 className="truncate font-display text-xl font-semibold text-ink">{active.label}</h1>
            </div>
          </div>
          <div className="mb-5 hidden md:block">
            <h2 className="type-h3">{active.label}</h2>
            <p className="mt-0.5 text-sm text-muted">{active.description}</p>
          </div>
          <div key={active.id} className="space-y-4">
            <Section {...sectionProps} />
          </div>

          <AnimatePresence>
            {dirty && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-20 mt-6 flex items-center gap-3 rounded-lg border border-border bg-ink px-4 py-3 text-white shadow-lg md:bottom-5"
                role="region"
                aria-label="Unsaved changes"
              >
                <p className="min-w-0 flex-1 text-sm">
                  <span className="font-medium">Unsaved changes</span>
                  <span className="hidden text-white/60 sm:inline">
                    {" "}
                    in {[...dirtySections].map((id) => sections.find((s) => s.id === id)?.label).join(", ")}
                  </span>
                </p>
                <Button size="sm" variant="ghost" onClick={() => setDraft(saved)} disabled={saving} className="text-white hover:bg-white/10 hover:text-white">
                  Discard
                </Button>
                <Button size="sm" onClick={save} loading={saving} loadingText="Saving…">
                  Save
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
