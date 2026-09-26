import {
  BarChart3,
  Blocks,
  CreditCard,
  Kanban,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  Sparkles,
  Target,
  Users,
  UsersRound,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { routes } from "@/lib/routes";

export type AppNavItem = {
  label: string;
  shortLabel?: string;
  href: string;
  icon: LucideIcon;
  description: string;
  badge?: number;
};

export type AppNavSection = {
  id: string;
  label?: string;
  items: AppNavItem[];
};

const overview: AppNavItem = {
  label: "Overview",
  shortLabel: "Home",
  href: routes.app.root,
  icon: LayoutDashboard,
  description: "Revenue, leads, pipeline and AI insights at a glance.",
};
const leads: AppNavItem = {
  label: "Leads",
  href: routes.app.leads,
  icon: Target,
  description: "Capture, score and qualify inbound and outbound leads.",
};
const contacts: AppNavItem = {
  label: "Contacts",
  href: routes.app.contacts,
  icon: Users,
  description: "Every customer and company relationship in one place.",
};
const pipeline: AppNavItem = {
  label: "Pipeline",
  href: routes.app.pipeline,
  icon: Kanban,
  description: "Track deals through every stage of your sales process.",
};
const conversations: AppNavItem = {
  label: "Conversations",
  shortLabel: "Inbox",
  href: routes.app.conversations,
  icon: MessagesSquare,
  description: "Email, chat and SMS threads with customers, unified.",
  badge: 4,
};
const automations: AppNavItem = {
  label: "Automations",
  href: routes.app.automations,
  icon: Workflow,
  description: "Build workflows that run your business on autopilot.",
};
const ai: AppNavItem = {
  label: "AI Assistant",
  shortLabel: "AI",
  href: routes.app.ai,
  icon: Sparkles,
  description: "Ask questions about your business and delegate work to AI.",
};
const analytics: AppNavItem = {
  label: "Analytics",
  href: routes.app.analytics,
  icon: BarChart3,
  description: "Reports and insights across sales, marketing and support.",
};

export const appNavigation: AppNavSection[] = [
  {
    id: "main",
    items: [overview, leads, contacts, pipeline, conversations, automations, ai, analytics],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      {
        label: "Integrations",
        href: routes.app.integrations,
        icon: Blocks,
        description: "Connect the tools your team already uses.",
      },
      {
        label: "Team",
        href: routes.app.team,
        icon: UsersRound,
        description: "Manage members, roles and permissions.",
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      {
        label: "Settings",
        href: routes.app.settings,
        icon: Settings,
        description: "Workspace, profile and security preferences.",
      },
      {
        label: "Billing",
        href: routes.app.billing,
        icon: CreditCard,
        description: "Plans, usage, invoices and payment methods.",
      },
    ],
  },
];

/** Primary destinations for the mobile bottom bar. */
export const mobileNavigation: AppNavItem[] = [overview, leads, pipeline, conversations, ai];

export const allAppNavItems = appNavigation.flatMap((section) => section.items);

function matches(item: AppNavItem, pathname: string) {
  return item.href === routes.app.root
    ? pathname === item.href || pathname === `${item.href}/`
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function findNavLocation(pathname: string) {
  for (const section of appNavigation) {
    const item = section.items.find((candidate) => matches(candidate, pathname));
    if (item) return { section, item };
  }
  return undefined;
}

export function findNavItem(pathname: string) {
  return findNavLocation(pathname)?.item;
}

export const currentUser = {
  name: "James Carter",
  email: "james@nexora.ai",
  role: "Owner",
  workspace: "Nexora HQ",
};
