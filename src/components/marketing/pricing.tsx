import { Link } from "react-router";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { plans, pricingFaqs, type Plan } from "@/data/marketing";
import { Badge, FadeIn, buttonVariants } from "@/components/ui";

export type Billing = "monthly" | "annual";

const darkSecondary =
  "border-white/15 bg-transparent text-white shadow-none hover:border-white/30 hover:bg-white/10 active:bg-white/15 focus-visible:border-white/40";

function planPrice(plan: Plan, billing: Billing) {
  return billing === "annual" ? plan.annual : plan.monthly;
}

export function PricingCta() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn inView className="grid grid-cols-1 gap-10 overflow-hidden rounded-2xl bg-ink p-8 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:p-14">
          <div className="flex flex-col justify-center">
            <p className="type-overline text-primary-border">Pricing</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Start free. Scale when you're ready.
            </h2>
            <p className="mt-4 max-w-md text-lg text-white/70">
              Every plan starts with a 14-day trial of Growth. No credit card, no setup fees, cancel anytime.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={routes.signup} className={buttonVariants({ size: "lg" })}>
                Start free
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link to={routes.pricing} className={buttonVariants({ variant: "secondary", size: "lg", className: darkSecondary })}>
                Compare plans
              </Link>
            </div>
          </div>
          <ul className="flex flex-col gap-3">
            {plans.map((plan) => (
              <li
                key={plan.id}
                className={cn(
                  "flex items-center justify-between gap-4 rounded-lg border px-5 py-4",
                  plan.popular ? "border-primary bg-white/[0.06]" : "border-white/10 bg-white/[0.03]",
                )}
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold text-white">
                    {plan.name}
                    {plan.popular && (
                      <Badge variant="primary" appearance="solid" size="sm">
                        Most popular
                      </Badge>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-white/60">{plan.description}</p>
                </div>
                <p className="shrink-0 text-right">
                  {plan.monthly === null ? (
                    <span className="text-sm font-medium text-white">Custom</span>
                  ) : (
                    <>
                      <span className="text-metric text-xl font-semibold text-white">${plan.monthly}</span>
                      <span className="block text-2xs text-white/50">per user / month</span>
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </section>
  );
}

export function PlanCards({ billing }: { billing: Billing }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => {
        const price = planPrice(plan, billing);
        return (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-lg border bg-white p-6 shadow-sm",
              plan.popular ? "border-primary shadow-focus" : "border-border",
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="type-h3">{plan.name}</h3>
              {plan.popular && <Badge variant="primary">Most popular</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted">{plan.description}</p>
            <div className="mt-6 flex items-baseline gap-1.5">
              {price === null ? (
                <span className="font-display text-4xl font-semibold text-ink">Custom</span>
              ) : (
                <>
                  <span className="text-metric text-4xl font-semibold text-ink">${price}</span>
                  <span className="text-sm text-muted">per user / month</span>
                </>
              )}
            </div>
            <p className="mt-1 h-4 text-xs text-subtle">
              {price !== null && billing === "annual" ? `Billed annually · $${price * 12} per user / year` : ""}
            </p>
            {plan.monthly === null ? (
              <a
                href="mailto:sales@nexora.ai"
                aria-label={`${plan.cta} about ${plan.name}`}
                className={buttonVariants({ variant: "secondary", className: "mt-6 w-full" })}
              >
                {plan.cta}
              </a>
            ) : (
              <Link
                to={routes.signup}
                aria-label={`${plan.cta} with ${plan.name}`}
                className={buttonVariants({ variant: plan.popular ? "primary" : "secondary", className: "mt-6 w-full" })}
              >
                {plan.cta}
              </Link>
            )}
            <ul className="mt-6 flex flex-col gap-2.5 border-t border-border-subtle pt-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-ink">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function PricingFaq() {
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-white">
      {pricingFaqs.map((faq) => (
        <details key={faq.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-5 py-4 text-sm font-medium text-ink outline-none transition-colors hover:bg-canvas focus-visible:shadow-focus [&::-webkit-details-marker]:hidden">
            {faq.question}
            <ChevronDown className="size-4 shrink-0 text-subtle transition-transform duration-150 group-open:rotate-180" aria-hidden />
          </summary>
          <p className="px-5 pb-5 text-sm text-muted">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
