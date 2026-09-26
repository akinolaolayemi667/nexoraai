import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { routes } from "@/lib/routes";
import { Seo } from "@/components/seo";
import { PricingCta, ProductCapabilities, Solutions } from "@/components/marketing";
import { FadeIn, buttonVariants } from "@/components/ui";

export default function FeaturesPage() {
  return (
    <>
      <Seo page="features" />
      <section aria-labelledby="features-heading" className="bg-white">
        <FadeIn className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <p className="type-overline text-primary">Features</p>
          <h1 id="features-heading" className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Everything your team needs, in one workspace.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            CRM, automation, AI and analytics built on a single data model, so every part of your operation works
            together.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to={routes.signup} className={buttonVariants({ size: "lg" })}>
              Start free
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link to={routes.pricing} className={buttonVariants({ variant: "secondary", size: "lg" })}>
              View pricing
            </Link>
          </div>
        </FadeIn>
      </section>
      <ProductCapabilities />
      <Solutions />
      <PricingCta />
    </>
  );
}
