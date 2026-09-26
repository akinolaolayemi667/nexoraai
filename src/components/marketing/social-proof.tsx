import { Link } from "react-router";
import { ArrowRight, Check } from "lucide-react";
import { routes } from "@/lib/routes";
import { integrations, testimonials } from "@/data/marketing";
import { Avatar, Stagger, StaggerItem, buttonVariants } from "@/components/ui";
import { Section, SectionHeading } from "./section";

export function Integrations() {
  return (
    <Section id="integrations" tone="canvas">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Integrations"
            title="Works with the tools you already use."
            description="Connect your inbox, calendar, payments and apps in a few clicks. Data syncs both ways, in real time."
          />
          <ul className="mt-6 flex flex-col gap-2.5">
            {[
              "Two-way sync with email, calendar and CRM",
              "Open REST API and webhooks",
              "6,000+ more apps through Zapier",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-ink">
                <Check className="size-4 text-success" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <Link
            to={routes.features}
            className={buttonVariants({ variant: "secondary", className: "mt-8" })}
          >
            Explore all features
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <Stagger inView stagger={0.03} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {integrations.map((item) => (
            <StaggerItem
              key={item.name}
              preset="scaleIn"
              className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-xs"
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-md font-display text-sm font-bold ${item.tint}`}
                aria-hidden
              >
                {item.mark}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">{item.name}</span>
                <span className="block truncate text-2xs text-muted">{item.category}</span>
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}

export function Testimonials() {
  return (
    <Section id="testimonials">
      <SectionHeading eyebrow="Customer stories" title="Teams run faster on NEXORA." />
      <Stagger inView className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
        {testimonials.map((item) => (
          <StaggerItem key={item.name}>
            <figure className="flex h-full flex-col rounded-lg border border-border bg-white p-6 shadow-sm">
              <div className="border-b border-border-subtle pb-5">
                <p className="text-metric text-3xl font-semibold text-primary">{item.metric}</p>
                <p className="mt-1 text-xs text-muted">{item.metricLabel}</p>
              </div>
              <blockquote className="mt-5 flex-1 text-base text-ink">“{item.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Avatar name={item.name} size="md" />
                <span>
                  <span className="block text-sm font-medium text-ink">{item.name}</span>
                  <span className="block text-xs text-muted">
                    {item.role}, {item.company}
                  </span>
                </span>
              </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
