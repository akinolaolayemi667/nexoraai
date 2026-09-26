import type { AuthUser } from "@/lib/auth/mock-auth";
import { useLocalStorage } from "@/hooks/use-local-storage";

export type TeamRole = "owner" | "admin" | "manager" | "member" | "viewer";
export type MemberStatus = "active" | "invited" | "suspended";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  title: string;
  role: TeamRole;
  status: MemberStatus;
  /** Last activity for active members; invite time for invited ones. */
  lastActive: number;
  joinedAt: number;
  department: string;
  isYou?: boolean;
};

export type TeamState = { version: number; members: TeamMember[] };

export const TEAM_VERSION = 1;

export const roles: { id: TeamRole; label: string; description: string; variant: "primary" | "accent" | "success" | "warning" | "neutral" }[] = [
  { id: "owner", label: "Owner", description: "Full control, including billing, security and deleting the workspace.", variant: "primary" },
  { id: "admin", label: "Admin", description: "Manage members, settings, integrations and every record.", variant: "accent" },
  { id: "manager", label: "Manager", description: "Run a team: assign leads, edit pipelines, see team reports.", variant: "success" },
  { id: "member", label: "Member", description: "Work their own leads, deals, tasks and conversations.", variant: "warning" },
  { id: "viewer", label: "Viewer", description: "Read-only access to records and dashboards.", variant: "neutral" },
];

export const roleMeta = Object.fromEntries(roles.map((r) => [r.id, r])) as Record<TeamRole, (typeof roles)[number]>;

/** Roles that can be granted from the UI. Ownership transfer is a separate flow. */
export const assignableRoles = roles.filter((r) => r.id !== "owner");

export const permissions: { label: string; roles: TeamRole[] }[] = [
  { label: "View records & dashboards", roles: ["owner", "admin", "manager", "member", "viewer"] },
  { label: "Create & edit own leads, deals and tasks", roles: ["owner", "admin", "manager", "member"] },
  { label: "Reply to conversations", roles: ["owner", "admin", "manager", "member"] },
  { label: "Assign leads & edit team records", roles: ["owner", "admin", "manager"] },
  { label: "Build & publish automations", roles: ["owner", "admin", "manager"] },
  { label: "Export data", roles: ["owner", "admin", "manager"] },
  { label: "Invite & manage members", roles: ["owner", "admin"] },
  { label: "Connect integrations", roles: ["owner", "admin"] },
  { label: "Workspace settings & security", roles: ["owner", "admin"] },
  { label: "Billing & subscription", roles: ["owner"] },
];

export const statusMeta: Record<MemberStatus, { label: string; variant: "success" | "warning" | "neutral" }> = {
  active: { label: "Active", variant: "success" },
  invited: { label: "Invited", variant: "warning" },
  suspended: { label: "Suspended", variant: "neutral" },
};

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

type Seed = [name: string, title: string, department: string, role: TeamRole, status: MemberStatus, lastAgo: number, joinedDaysAgo: number];

const seeds: Seed[] = [
  ["James Carter", "Head of Sales", "Sales", "admin", "active", 4 * MIN, 610],
  ["Maya Chen", "Account Executive", "Sales", "manager", "active", 0, 420],
  ["Daniel Okafor", "Account Executive", "Sales", "member", "active", 2 * HOUR, 380],
  ["Sofia Alvarez", "Customer Success Lead", "Success", "manager", "active", 35 * MIN, 300],
  ["Liam Walsh", "SDR", "Sales", "member", "active", 1 * DAY + 3 * HOUR, 150],
  ["Priya Nair", "Marketing Manager", "Marketing", "member", "active", 3 * HOUR, 210],
  ["Tom Becker", "Operations Analyst", "Operations", "viewer", "active", 6 * DAY, 90],
  ["Aisha Bello", "Support Specialist", "Success", "member", "suspended", 41 * DAY, 260],
  ["Noah Kim", "Finance Controller", "Finance", "viewer", "active", 12 * DAY, 45],
  ["Elena Rossi", "Account Executive", "Sales", "member", "invited", 2 * DAY, 2],
  ["Marcus Reid", "RevOps Lead", "Operations", "admin", "invited", 5 * HOUR, 0],
];

const slug = (name: string) => name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "");

export function emailFor(name: string, company: string) {
  const domain = company.toLowerCase().replace(/[^a-z0-9]+/g, "") || "nexora";
  return `${slug(name)}@${domain}.com`;
}

export function createTeam(user: AuthUser, now = Date.now()): TeamState {
  const you: TeamMember = {
    id: "mbr_you",
    name: user.name,
    email: user.email,
    title: "Founder & CEO",
    role: "owner",
    status: "active",
    lastActive: now,
    joinedAt: now - 640 * DAY,
    department: "Leadership",
    isYou: true,
  };
  const members = seeds
    .filter(([name]) => name !== user.name)
    .map(([name, title, department, role, status, lastAgo, joinedDaysAgo], i): TeamMember => ({
      id: `mbr_${i}_${slug(name).replace(/\./g, "")}`,
      name,
      email: emailFor(name, user.company),
      title,
      role,
      status,
      lastActive: now - lastAgo,
      joinedAt: now - joinedDaysAgo * DAY,
      department,
    }));
  return { version: TEAM_VERSION, members: [you, ...members] };
}

export function useTeam(user: AuthUser) {
  return useLocalStorage<TeamState>(`nexora:team:v${TEAM_VERSION}:${user.id}`, createTeam(user));
}

/** Seats count active and invited members; suspended members free their seat. */
export const seatsUsed = (members: TeamMember[]) => members.filter((m) => m.status !== "suspended").length;

export function lastActiveLabel(member: TeamMember, now: number) {
  const diff = now - member.lastActive;
  if (member.status === "invited") return diff < HOUR ? "Invited just now" : `Invited ${ago(diff)}`;
  if (member.isYou || diff < 5 * MIN) return "Online now";
  return ago(diff);
}

function ago(diff: number) {
  if (diff < HOUR) return `${Math.max(1, Math.round(diff / MIN))} min ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} hr ago`;
  const days = Math.floor(diff / DAY);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}
