export type LeadStatus = "new" | "contacted" | "qualified" | "nurturing" | "won" | "lost";

export type LeadSource = "organic" | "referral" | "paid" | "social" | "events";

export type ScoreTier = "hot" | "warm" | "cool" | "cold";

export type Owner = { id: string; name: string; title: string };

export type Lead = {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  ownerId: string;
  lastActivity: string;
  lastActivityAt: number;
  createdAt: number;
  /** Snapshot of the demo data this lead was generated with; its seeded history is derived from it. */
  seed?: { activity: string; at: number; status: LeadStatus };
};

export type DealStage = "new" | "qualified" | "discovery" | "proposal" | "negotiation" | "won" | "lost";

export type Deal = {
  id: string;
  name: string;
  company: string;
  contactId: string | null;
  value: number;
  probability: number;
  stage: DealStage;
  ownerId: string;
  expectedClose: string;
  lastActivityAt: number;
  createdAt: number;
  closedAt?: number;
};

export type Note = {
  id: string;
  leadId: string;
  body: string;
  author: string;
  createdAt: number;
};

export type TaskPriority = "high" | "medium" | "low";

export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  leadId: string;
  title: string;
  dueAt: number;
  done: boolean;
  ownerId: string;
  createdAt: number;
  priority?: TaskPriority;
  /** `done` stays the source of truth for completion; this only distinguishes to-do from in-progress. */
  status?: TaskStatus;
  completedAt?: number;
};

export type ActivityType = "email" | "call" | "meeting" | "note" | "task" | "status" | "deal" | "web" | "form";

export type Activity = {
  id: string;
  leadId: string;
  type: ActivityType;
  title: string;
  detail?: string;
  actor?: string;
  at: number;
};

export type Message = {
  id: string;
  direction: "inbound" | "outbound";
  author: string;
  body: string;
  at: number;
};

export type Thread = {
  id: string;
  leadId: string;
  channel: "email" | "chat" | "sms";
  subject: string;
  messages: Message[];
};

export type CrmState = {
  version: number;
  seededAt: number;
  leads: Lead[];
  deals: Deal[];
  notes: Note[];
  tasks: Task[];
  activities: Activity[];
  replies: Record<string, Message[]>;
  /** Bumped when seeded tasks gain new fields, so stored workspaces can be upgraded in place. */
  taskSchema?: number;
};
