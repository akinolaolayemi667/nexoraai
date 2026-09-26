import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { capabilities, overviewSteps, solutions } from "@/data/marketing";
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

export function Capabilities() {
  return (
    <Section id="capabilities" tone="canvas">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          align="left"
          eyebrow="Key capabilities"
          title="Everything you need to run revenue operations."
        />
        <p className="max-w-sm text-sm text-muted">
          Replace a stack of disconnected tools with one workspace your whole team actually uses.
        </p>
      </div>
      <Stagger inView className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((item) => (
          <StaggerItem key={item.title}>
            <Link
              to={item.href}
              className="group flex h-full flex-col rounded-lg border border-border bg-white p-5 outline-none transition-[border-color,box-shadow] duration-150 hover:border-border-strong hover:shadow-md focus-visible:border-primary focus-visible:shadow-focus"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-md bg-sunken text-ink transition-colors group-hover:bg-primary-soft group-hover:text-primary">
                  <item.icon className="size-4" aria-hidden />
                </span>
                <ArrowUpRight
                  className="size-4 text-subtle opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  aria-hidden
                />
              </div>
              <h3 className="type-h4 mt-4">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.description}</p>
            </Link>
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
