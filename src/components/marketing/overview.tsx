import { overviewSteps, solutions } from "@/data/marketing";
import { Stagger, StaggerItem } from "@/components/ui";
import { Section, SectionHeading } from "./section";

export function ProductOverview() {
  return (
    <Section id="product">
      <SectionHeading
        eyebrow="Product overview"
        title={
          <>
            AI-Powered Operations.
            <br />
            One Intelligent Workspace.
          </>
        }
        description="NEXORA brings your leads, customers, conversations and workflows together, then adds an AI layer that keeps everything moving."
      />
      <Stagger inView className="relative mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="absolute left-[16%] right-[16%] top-9 hidden h-px bg-border md:block" aria-hidden />
        {overviewSteps.map((step) => (
          <StaggerItem key={step.step} className="relative rounded-lg border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-lg border border-primary-border bg-primary-soft/60 text-primary">
                <step.icon className="size-5" aria-hidden />
              </span>
              <span className="font-mono text-xs font-medium text-subtle">{step.step}</span>
            </div>
            <h3 className="type-h3 mt-5">{step.title}</h3>
            <p className="mt-2 text-sm text-muted">{step.description}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

export function Solutions() {
  return (
    <Section id="solutions">
      <SectionHeading
        eyebrow="Solutions"
        title="Built for every revenue team."
        description="Sales, marketing, success and operations share one source of truth, and each team gets the views it needs."
      />
      <Stagger inView className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {solutions.map((item) => (
          <StaggerItem key={item.title} className="flex flex-col bg-white p-6">
            <item.icon className="size-5 text-primary" aria-hidden />
            <h3 className="type-h4 mt-4">{item.title}</h3>
            <p className="mt-1.5 flex-1 text-sm text-muted">{item.description}</p>
            <div className="mt-6 border-t border-border-subtle pt-4">
              <p className="text-metric text-2xl font-semibold text-ink">{item.metric}</p>
              <p className="text-xs text-muted">{item.metricLabel}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
