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
  href: string;
  icon: LucideIcon;
  description: string;
};

export type AppNavSection = {
  label?: string;
  items: AppNavItem[];
};

export const appNavigation: AppNavSection[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: routes.app.root,
        icon: LayoutDashboard,
        description: "Your revenue, pipeline and team performance at a glance.",
      },
      {
        label: "AI Assistant",
        href: routes.app.ai,
        icon: Sparkles,
        description: "Ask questions about your business and delegate work to AI.",
      },
    ],
  },
  {
    label: "CRM",
    items: [
      {
        label: "Leads",
        href: routes.app.leads,
        icon: Target,
        description: "Capture, score and qualify inbound and outbound leads.",
      },
      {
        label: "Contacts",
        href: routes.app.contacts,
        icon: Users,
        description: "Every customer and company relationship in one place.",
      },
      {
        label: "Pipeline",
        href: routes.app.pipeline,
        icon: Kanban,
        description: "Track deals through every stage of your sales process.",
      },
      {
        label: "Conversations",
        href: routes.app.conversations,
        icon: MessagesSquare,
        description: "Email, chat and SMS threads with customers, unified.",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Automations",
        href: routes.app.automations,
        icon: Workflow,
        description: "Build workflows that run your business on autopilot.",
      },
      {
        label: "Analytics",
        href: routes.app.analytics,
        icon: BarChart3,
        description: "Reports and insights across sales, marketing and support.",
      },
      {
        label: "Integrations",
        href: routes.app.integrations,
        icon: Blocks,
        description: "Connect the tools your team already uses.",
      },
    ],
  },
];

export const appSecondaryNavigation: AppNavItem[] = [
  {
    label: "Team",
    href: routes.app.team,
    icon: UsersRound,
    description: "Manage members, roles and permissions.",
  },
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
];

export const allAppNavItems = [
  ...appNavigation.flatMap((section) => section.items),
  ...appSecondaryNavigation,
];

export function findNavItem(pathname: string) {
  return allAppNavItems.find((item) => item.href === pathname);
}

export const marketingNavigation = [
  { label: "Features", href: routes.features },
  { label: "Pricing", href: routes.pricing },
];

export const currentUser = {
  name: "Olayemi Akinola",
  email: "olayemi@nexora.ai",
  role: "Owner",
  workspace: "Nexora HQ",
};
