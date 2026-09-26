import type { DealStage, LeadSource, LeadStatus, Owner, ScoreTier } from "./types";

export const leadStatuses: { id: LeadStatus; label: string; badge: string; dot: string; description: string }[] = [
  {
    id: "new",
    label: "New",
    badge: "bg-sky-50 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
    description: "Hasn't been contacted yet",
  },
  {
    id: "contacted",
    label: "Contacted",
    badge: "bg-accent-soft text-accent ring-accent-border",
    dot: "bg-accent",
    description: "Outreach started, awaiting a reply",
  },
  {
    id: "qualified",
    label: "Qualified",
    badge: "bg-primary-soft/60 text-primary-active ring-primary-border",
    dot: "bg-primary",
    description: "Good fit with budget and intent",
  },
  {
    id: "nurturing",
    label: "Nurturing",
    badge: "bg-warning-soft text-warning-text ring-warning-border",
    dot: "bg-warning",
    description: "Interested, but not ready to buy",
  },
  {
    id: "won",
    label: "Won",
    badge: "bg-success-soft text-success-text ring-success-border",
    dot: "bg-success",
    description: "Became a customer",
  },
  {
    id: "lost",
    label: "Lost",
    badge: "bg-danger-soft text-danger-text ring-danger-border",
    dot: "bg-danger",
    description: "Not moving forward",
  },
];

export const statusMeta = Object.fromEntries(leadStatuses.map((s) => [s.id, s])) as Record<
  LeadStatus,
  (typeof leadStatuses)[number]
>;

export const leadSources: { id: LeadSource; label: string }[] = [
  { id: "organic", label: "Organic search" },
  { id: "referral", label: "Referral" },
  { id: "paid", label: "Paid ads" },
  { id: "social", label: "Social" },
  { id: "events", label: "Events" },
];

export const sourceLabel = Object.fromEntries(leadSources.map((s) => [s.id, s.label])) as Record<LeadSource, string>;

export const owners: Owner[] = [
  { id: "james", name: "James Carter", title: "Head of Sales" },
  { id: "maya", name: "Maya Chen", title: "Account Executive" },
  { id: "daniel", name: "Daniel Okafor", title: "Account Executive" },
  { id: "sofia", name: "Sofia Alvarez", title: "SDR Lead" },
  { id: "liam", name: "Liam Walsh", title: "SDR" },
];

const ownerMap = new Map(owners.map((o) => [o.id, o]));

export function ownerById(id: string): Owner {
  return ownerMap.get(id) ?? { id, name: "Unassigned", title: "" };
}

/** Signed-in users outside the demo team act as James's seat. */
export function ownerIdFor(userName: string) {
  return owners.find((o) => o.name === userName)?.id ?? "james";
}

export function ownerFirstName(id: string) {
  return ownerById(id).name.split(" ")[0];
}

export const scoreTiers: { id: ScoreTier; label: string; range: string; min: number; max: number }[] = [
  { id: "hot", label: "Hot", range: "80–100", min: 80, max: 100 },
  { id: "warm", label: "Warm", range: "60–79", min: 60, max: 79 },
  { id: "cool", label: "Cool", range: "40–59", min: 40, max: 59 },
  { id: "cold", label: "Cold", range: "0–39", min: 0, max: 39 },
];

export function scoreTier(score: number): ScoreTier {
  if (score >= 80) return "hot";
  if (score >= 60) return "warm";
  if (score >= 40) return "cool";
  return "cold";
}

export const dealStages: { id: DealStage; label: string; color: string; probability: number }[] = [
  { id: "new", label: "New Lead", color: "var(--color-chart-6)", probability: 10 },
  { id: "qualified", label: "Qualified", color: "var(--color-chart-3)", probability: 30 },
  { id: "discovery", label: "Discovery", color: "var(--color-chart-4)", probability: 45 },
  { id: "proposal", label: "Proposal", color: "var(--color-chart-1)", probability: 65 },
  { id: "negotiation", label: "Negotiation", color: "var(--color-chart-2)", probability: 80 },
  { id: "won", label: "Won", color: "var(--color-success)", probability: 100 },
  { id: "lost", label: "Lost", color: "var(--color-danger)", probability: 0 },
];

export const stageMeta = Object.fromEntries(dealStages.map((s) => [s.id, s])) as Record<
  DealStage,
  (typeof dealStages)[number]
>;

export const isOpenStage = (stage: DealStage) => stage !== "won" && stage !== "lost";
