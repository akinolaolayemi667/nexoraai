import { useState } from "react";
import { Link } from "react-router";
import { routes } from "@/lib/routes";
import { PlanCards, PricingFaq, Section, SectionHeading, type Billing } from "@/components/marketing";
import { FadeIn, Tabs, buttonVariants } from "@/components/ui";

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("annual");

  return (
    <>
      <title>Pricing · NEXORA AI</title>
      <section className="border-b border-border bg-canvas">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="type-overline text-primary">Pricing</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Simple pricing that scales with you.
            </h1>
            <p className="mt-5 text-lg text-muted">
              Start with a 14-day free trial of Growth. No credit card required.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Tabs
                variant="segmented"
                value={billing}
                onValueChange={(value) => setBilling(value as Billing)}
                items={[
                  { value: "monthly", label: "Monthly" },
                  { value: "annual", label: "Annual" },
                ]}
              />
              <span className="text-xs font-medium text-success-text">Save up to 17% annually</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.1} className="mt-12">
            <PlanCards billing={billing} />
          </FadeIn>
        </div>
      </section>

      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <SectionHeading
              align="left"
              eyebrow="FAQ"
              title="Questions, answered."
              description="Can't find what you're looking for? Our team replies within one business hour."
            />
            <Link to={routes.signup} className={buttonVariants({ className: "mt-8" })}>
              Start free
            </Link>
          </div>
          <PricingFaq />
        </div>
      </Section>
    </>
  );
}
