import {
  BarChart3,
  BookOpen,
  Briefcase,
  Headphones,
  History,
  Kanban,
  LifeBuoy,
  Megaphone,
  MessagesSquare,
  PlayCircle,
  Quote,
  Settings2,
  Sparkles,
  Target,
  Users,
  UsersRound,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { routes } from "@/lib/routes";

export type MarketingMenuItem = {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
  soon?: boolean;
};

export type MarketingNavEntry =
  | { label: string; href: string }
  | { label: string; items: MarketingMenuItem[] };

export const marketingNavigation: MarketingNavEntry[] = [
  {
    label: "Product",
    items: [
      { label: "CRM", href: "/#crm", description: "Customers and leads in one workspace", icon: Users },
      { label: "AI Assistant", href: "/#ai", description: "Recommendations and summaries", icon: Sparkles },
      { label: "Automations", href: "/#automation", description: "Workflows that do the repetitive work", icon: Workflow },
      { label: "Pipeline", href: "/#pipeline", description: "Every opportunity, every stage", icon: Kanban },
      { label: "Analytics", href: "/#analytics", description: "Understand business performance", icon: BarChart3 },
      { label: "Conversations", href: "/#conversations", description: "Every customer interaction in one inbox", icon: MessagesSquare },
      { label: "Team", href: "/#team", description: "Collaborate across departments", icon: UsersRound },
    ],
  },
  {
    label: "Solutions",
    items: [
      { label: "Sales teams", href: "/#solutions", description: "Close more deals with less admin", icon: Briefcase },
      { label: "Marketing", href: "/#solutions", description: "Turn campaigns into qualified pipeline", icon: Megaphone },
      { label: "Customer success", href: "/#solutions", description: "Retain and expand every account", icon: Headphones },
      { label: "Operations", href: "/#solutions", description: "Standardise how work gets done", icon: Settings2 },
    ],
  },
  { label: "Features", href: routes.features },
  { label: "Integrations", href: "/#integrations" },
  { label: "Pricing", href: routes.pricing },
  {
    label: "Resources",
    items: [
      { label: "How it works", href: "/#product", description: "See the platform in three steps", icon: PlayCircle },
      { label: "Customer stories", href: "/#testimonials", description: "How teams run on NEXORA", icon: Quote },
      { label: "Documentation", href: "#", description: "Guides and API reference", icon: BookOpen, soon: true },
      { label: "Changelog", href: "#", description: "What's new in NEXORA", icon: History, soon: true },
      { label: "Help center", href: "#", description: "Answers from our support team", icon: LifeBuoy, soon: true },
    ],
  },
];

export const customerLogos = ["Brightline", "Northwind", "Helio", "Stackfield", "Aurora", "Kestrel", "Meridian"];

export const overviewSteps = [
  {
    step: "01",
    title: "Capture everything",
    description:
      "Leads, emails, chats and calls flow into one timeline automatically, enriched with company data and scored by AI.",
    icon: Target,
  },
  {
    step: "02",
    title: "Automate the busywork",
    description:
      "Routing, follow-ups, reminders and handoffs run on workflows you build in minutes, not weeks.",
    icon: Workflow,
  },
  {
    step: "03",
    title: "Act on real insight",
    description:
      "Live dashboards and an AI analyst tell you what changed, why it matters and what to do next.",
    icon: Sparkles,
  },
];

export const solutions = [
  {
    title: "Sales teams",
    description: "Prioritise the deals most likely to close and let AI handle follow-ups.",
    metric: "+32%",
    metricLabel: "win rate",
    icon: Briefcase,
  },
  {
    title: "Marketing",
    description: "Route and score every inbound lead the moment it arrives.",
    metric: "4 min",
    metricLabel: "speed to lead",
    icon: Megaphone,
  },
  {
    title: "Customer success",
    description: "Spot churn risk and expansion signals before renewal season.",
    metric: "−41%",
    metricLabel: "churn",
    icon: Headphones,
  },
  {
    title: "Operations",
    description: "Standardise processes and see where work gets stuck.",
    metric: "11 hrs",
    metricLabel: "saved per person / week",
    icon: Settings2,
  },
];

export type Integration = { name: string; category: string; mark: string; tint: string };

export const integrations: Integration[] = [
  { name: "Gmail", category: "Email", mark: "G", tint: "bg-danger-soft text-danger-text" },
  { name: "Outlook", category: "Email", mark: "O", tint: "bg-primary-soft text-primary-active" },
  { name: "Slack", category: "Messaging", mark: "S", tint: "bg-accent-soft text-accent-hover" },
  { name: "WhatsApp", category: "Messaging", mark: "W", tint: "bg-success-soft text-success-text" },
  { name: "HubSpot", category: "CRM", mark: "H", tint: "bg-warning-soft text-warning-text" },
  { name: "Salesforce", category: "CRM", mark: "S", tint: "bg-sky-50 text-sky-700" },
  { name: "Stripe", category: "Payments", mark: "S", tint: "bg-accent-soft text-accent-hover" },
  { name: "Shopify", category: "Commerce", mark: "S", tint: "bg-success-soft text-success-text" },
  { name: "Google Calendar", category: "Scheduling", mark: "C", tint: "bg-primary-soft text-primary-active" },
  { name: "Zapier", category: "Automation", mark: "Z", tint: "bg-warning-soft text-warning-text" },
  { name: "QuickBooks", category: "Finance", mark: "Q", tint: "bg-success-soft text-success-text" },
  { name: "Notion", category: "Docs", mark: "N", tint: "bg-sunken text-ink" },
];

export const testimonials = [
  {
    quote:
      "We replaced four tools with NEXORA. Our reps start every morning with a prioritised list and the follow-ups are already drafted.",
    name: "Amara Okafor",
    role: "VP Sales",
    company: "Brightline Logistics",
    metric: "3.2×",
    metricLabel: "pipeline in two quarters",
  },
  {
    quote:
      "Inbound leads used to wait a day for a reply. Now they're scored, routed and contacted in under five minutes, automatically.",
    name: "Daniel Reyes",
    role: "Head of Growth",
    company: "Northwind Health",
    metric: "4 min",
    metricLabel: "average speed to lead",
  },
  {
    quote:
      "The AI insights caught churn signals we would have missed. It feels like having an analyst on the team who never sleeps.",
    name: "Sofia Lindqvist",
    role: "Director of Customer Success",
    company: "Helio Energy",
    metric: "−41%",
    metricLabel: "customer churn",
  },
];

export type Plan = {
  id: string;
  name: string;
  description: string;
  monthly: number | null;
  annual: number | null;
  cta: string;
  popular?: boolean;
  features: string[];
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For small teams getting organised.",
    monthly: 29,
    annual: 24,
    cta: "Start free",
    features: ["Up to 3 users", "CRM, leads & pipeline", "Unified inbox", "5 active automations", "Standard reports"],
  },
  {
    id: "growth",
    name: "Growth",
    description: "For teams scaling revenue with AI.",
    monthly: 79,
    annual: 66,
    cta: "Start free",
    popular: true,
    features: [
      "Up to 25 users",
      "Everything in Starter",
      "AI assistant & insights",
      "Unlimited automations",
      "Custom dashboards",
      "All integrations",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    description: "For organisations with advanced needs.",
    monthly: null,
    annual: null,
    cta: "Talk to sales",
    features: [
      "Unlimited users",
      "Everything in Growth",
      "SSO & SCIM",
      "Advanced permissions & audit log",
      "Dedicated success manager",
      "99.9% uptime SLA",
    ],
  },
];

export const pricingFaqs = [
  {
    question: "Is there really a free trial?",
    answer: "Yes. Every plan starts with a 14-day free trial of Growth features. No credit card is required to start.",
  },
  {
    question: "Can I change plans later?",
    answer: "Anytime. Upgrades apply immediately and downgrades take effect at the end of your billing period.",
  },
  {
    question: "How is the AI assistant priced?",
    answer: "AI features are included in Growth and Scale with generous monthly limits. You'll never be charged overages without opting in.",
  },
  {
    question: "Can you migrate our existing CRM data?",
    answer: "Yes. Import from HubSpot, Salesforce, Pipedrive or CSV in a few clicks. Scale customers get white-glove migration.",
  },
];

export const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "CRM", href: "/#crm" },
      { label: "AI Assistant", href: "/#ai" },
      { label: "Automations", href: "/#automation" },
      { label: "Pipeline", href: "/#pipeline" },
      { label: "Analytics", href: "/#analytics" },
      { label: "Conversations", href: "/#conversations" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Sales teams", href: "/#solutions" },
      { label: "Marketing", href: "/#solutions" },
      { label: "Customer success", href: "/#solutions" },
      { label: "Operations", href: "/#solutions" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Features", href: routes.features },
      { label: "Integrations", href: "/#integrations" },
      { label: "Pricing", href: routes.pricing },
      { label: "Customer stories", href: "/#testimonials" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Start free", href: routes.signup },
      { label: "Log in", href: routes.login },
      { label: "Open the app", href: routes.app.root },
    ],
  },
];
