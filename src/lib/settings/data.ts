import type { AuthUser } from "@/lib/auth/mock-auth";
import type { TeamRole } from "@/lib/team/data";

export type SectionId = "general" | "workspace" | "notifications" | "security" | "ai" | "integrations" | "team" | "billing";

export type Channel = "email" | "push" | "inapp";

export const notificationEvents: { id: string; label: string; description: string }[] = [
  { id: "lead_assigned", label: "Lead assigned to me", description: "A new or existing lead is routed to you." },
  { id: "inbox_message", label: "New customer message", description: "A reply lands in a conversation you own." },
  { id: "deal_stage", label: "Deal changes stage", description: "Deals you own move forward, stall or close." },
  { id: "task_due", label: "Task due or overdue", description: "Reminders on the morning a task is due." },
  { id: "mention", label: "Mentions", description: "A teammate @mentions you in a note." },
  { id: "ai_insight", label: "AI insights", description: "Churn risk, hot leads and next-best actions." },
  { id: "automation_failed", label: "Automation fails", description: "A workflow step errors or is skipped." },
  { id: "weekly_report", label: "Weekly report", description: "Monday summary of pipeline and team activity." },
];

export const channels: { id: Channel; label: string }[] = [
  { id: "email", label: "Email" },
  { id: "push", label: "Push" },
  { id: "inapp", label: "In-app" },
];

export type Settings = {
  version: number;
  general: { name: string; title: string; phone: string; timezone: string; language: string; dateFormat: "mdy" | "dmy" | "ymd"; weekStart: "monday" | "sunday" };
  workspace: { name: string; slug: string; industry: string; size: string; currency: string; fiscalStart: string; hoursStart: string; hoursEnd: string };
  notifications: { matrix: Record<string, Record<Channel, boolean>>; digest: "daily" | "weekly" | "off"; quietHours: boolean; quietStart: string; quietEnd: string };
  security: { twoFactor: boolean; sessionTimeout: string; loginAlerts: boolean };
  ai: {
    enabled: boolean;
    tone: "professional" | "friendly" | "concise";
    length: "short" | "medium" | "detailed";
    draftReplies: boolean;
    summaries: boolean;
    leadScoring: boolean;
    nextActions: boolean;
    afterHours: boolean;
    confidence: number;
    personalize: boolean;
    redactPii: boolean;
    retention: string;
  };
  integrations: { apiKey: string; webhookUrl: string };
  team: { defaultRole: Exclude<TeamRole, "owner">; allowedDomains: string; membersCanInvite: boolean; require2fa: boolean };
  billing: { billingEmail: string; taxId: string; invoiceEmails: boolean };
};

export const SETTINGS_VERSION = 1;

const on = (email: boolean, push: boolean, inapp: boolean) => ({ email, push, inapp });

export function randomKey() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return `nx_live_${Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")}`;
}

export function defaultSettings(user: AuthUser): Settings {
  const slug = user.company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace";
  return {
    version: SETTINGS_VERSION,
    general: {
      name: user.name,
      title: "Founder & CEO",
      phone: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      language: "en-US",
      dateFormat: "mdy",
      weekStart: "monday",
    },
    workspace: { name: user.company, slug, industry: "software", size: "11-50", currency: "USD", fiscalStart: "january", hoursStart: "09:00", hoursEnd: "18:00" },
    notifications: {
      matrix: {
        lead_assigned: on(true, true, true),
        inbox_message: on(false, true, true),
        deal_stage: on(true, false, true),
        task_due: on(true, true, true),
        mention: on(true, true, true),
        ai_insight: on(false, false, true),
        automation_failed: on(true, false, true),
        weekly_report: on(true, false, false),
      },
      digest: "daily",
      quietHours: true,
      quietStart: "20:00",
      quietEnd: "08:00",
    },
    security: { twoFactor: false, sessionTimeout: "7d", loginAlerts: true },
    ai: {
      enabled: true,
      tone: "friendly",
      length: "medium",
      draftReplies: true,
      summaries: true,
      leadScoring: true,
      nextActions: true,
      afterHours: false,
      confidence: 80,
      personalize: true,
      redactPii: true,
      retention: "90",
    },
    integrations: { apiKey: randomKey(), webhookUrl: "" },
    team: { defaultRole: "member", allowedDomains: user.email.split("@")[1] ?? "", membersCanInvite: false, require2fa: false },
    billing: { billingEmail: user.email, taxId: "", invoiceEmails: true },
  };
}

export const timezones = [
  "Pacific/Honolulu",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "UTC",
  "Europe/London",
  "Africa/Lagos",
  "Europe/Berlin",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];
