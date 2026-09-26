import { BarChart3, Blocks, Kanban, MessagesSquare, Sparkles, Users, UsersRound, Workflow } from "lucide-react";
import { FadeIn } from "@/components/ui";
import { Section, SectionHeading } from "../section";
import { AiPreview } from "./ai-preview";
import { AnalyticsPreview } from "./analytics-preview";
import { AutomationPreview } from "./automation-preview";
import { ConversationsPreview } from "./conversations-preview";
import { CrmPreview } from "./crm-preview";
import { FeatureCard, FeatureRow, type FeatureMeta } from "./feature-layout";
import { IntegrationsPreview } from "./integrations-preview";
import { PipelinePreview } from "./pipeline-preview";
import { TeamPreview } from "./team-preview";

const features = {
  crm: {
    id: "crm",
    icon: Users,
    name: "CRM",
    title: "Manage customers and leads from one workspace.",
    description: "Every contact, company and deal in one searchable place, scored by AI and updated automatically.",
  },
  ai: {
    id: "ai",
    icon: Sparkles,
    name: "AI Assistant",
    title: "Get intelligent recommendations and summaries.",
    description: "Ask questions in plain English and get answers grounded in your own data.",
  },
  automation: {
    id: "automation",
    icon: Workflow,
    name: "Automations",
    title: "Create workflows that execute repetitive work.",
    description: "Trigger on any event, branch on any field and let AI make the judgement calls in between.",
    points: ["Visual, no-code builder", "AI decision steps", "Test runs with a full log"],
  },
  pipeline: {
    id: "pipeline",
    icon: Kanban,
    name: "Pipeline",
    title: "Track opportunities through every sales stage.",
    description: "Move deals forward and watch your weighted forecast update instantly.",
  },
  analytics: {
    id: "analytics",
    icon: BarChart3,
    name: "Analytics",
    title: "Understand business performance.",
    description: "Live dashboards for revenue, leads and win rate, with AI explaining what changed.",
  },
  conversations: {
    id: "conversations",
    icon: MessagesSquare,
    name: "Conversations",
    title: "Manage customer interactions.",
    description: "Email, live chat and SMS in one inbox, tied to the right customer with AI-drafted replies.",
    points: ["One inbox for every channel", "Suggested replies", "Full customer context"],
  },
  integrations: {
    id: "integrations",
    icon: Blocks,
    name: "Integrations",
    title: "Connect existing business tools.",
    description: "Sync the apps your team already relies on in a couple of clicks.",
  },
  team: {
    id: "team",
    icon: UsersRound,
    name: "Team",
    title: "Collaborate across departments.",
    description: "Share plans, records and context between sales, marketing, success and ops.",
  },
} satisfies Record<string, FeatureMeta>;

export function ProductCapabilities() {
  return (
    <Section id="capabilities" tone="canvas">
      <SectionHeading
        eyebrow="Capabilities"
        title="Everything your business runs on, working together."
        description="Eight connected capabilities on one data model. Try them below: every preview is interactive."
      />
      <div className="mt-14 flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <FadeIn inView className="lg:col-span-7">
            <FeatureCard meta={features.crm} className="h-full">
              <CrmPreview />
            </FeatureCard>
          </FadeIn>
          <FadeIn inView delay={0.08} className="lg:col-span-5">
            <FeatureCard meta={features.ai} className="h-full">
              <AiPreview />
            </FeatureCard>
          </FadeIn>
        </div>

        <FadeIn inView>
          <FeatureRow meta={features.automation}>
            <AutomationPreview />
          </FeatureRow>
        </FadeIn>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <FadeIn inView className="lg:col-span-5">
            <FeatureCard meta={features.pipeline} className="h-full">
              <PipelinePreview />
            </FeatureCard>
          </FadeIn>
          <FadeIn inView delay={0.08} className="lg:col-span-7">
            <FeatureCard meta={features.analytics} className="h-full">
              <AnalyticsPreview />
            </FeatureCard>
          </FadeIn>
        </div>

        <FadeIn inView>
          <FeatureRow meta={features.conversations} reverse>
            <ConversationsPreview />
          </FeatureRow>
        </FadeIn>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <FadeIn inView className="lg:col-span-5">
            <FeatureCard meta={features.team} className="h-full">
              <TeamPreview />
            </FeatureCard>
          </FadeIn>
          <FadeIn inView delay={0.08} className="lg:col-span-7">
            <FeatureCard meta={features.integrations} className="h-full">
              <IntegrationsPreview />
            </FeatureCard>
          </FadeIn>
        </div>
      </div>
    </Section>
  );
}
