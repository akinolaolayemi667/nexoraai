import { Link } from "react-router";
import { ArrowRight, Check, PlayCircle, Sparkles } from "lucide-react";
import { routes } from "@/lib/routes";
import { customerLogos } from "@/data/marketing";
import { FadeIn, Stagger, StaggerItem, buttonVariants } from "@/components/ui";
import { DashboardPreview } from "./dashboard-preview";

const ctaText = "text-xs font-semibold uppercase tracking-wider";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[linear-gradient(to_right,var(--color-border-subtle)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border-subtle)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_0%,black,transparent)]"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 h-[42%] border-t border-border bg-canvas" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-6 pt-16 sm:pt-24">
        <Stagger className="mx-auto flex max-w-3xl flex-col items-center text-center" stagger={0.06}>
          <StaggerItem>
            <span className="inline-flex items-center gap-2 rounded-md border border-primary-border bg-white px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider text-primary-active shadow-xs">
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              AI-powered business operations
            </span>
          </StaggerItem>
          <StaggerItem>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Run Your Business
              <br />
              <span className="text-primary">With Intelligence Built In.</span>
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
              Manage leads, automate workflows, understand your customers and move your business forward from one
              intelligent platform.
            </p>
          </StaggerItem>
          <StaggerItem>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Link to={routes.signup} className={buttonVariants({ size: "lg", className: `${ctaText} px-6` })}>
                Start free
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                to="/#product"
                className={buttonVariants({ variant: "secondary", size: "lg", className: `${ctaText} px-6` })}
              >
                <PlayCircle className="size-4 text-primary" aria-hidden />
                See how it works
              </Link>
            </div>
          </StaggerItem>
          <StaggerItem>
            <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted">
              {["14-day free trial", "No credit card required", "Set up in minutes"].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="size-4 text-success" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </StaggerItem>
        </Stagger>

        <FadeIn preset="fadeUp" delay={0.3} className="mt-14 sm:mt-16">
          <DashboardPreview />
        </FadeIn>

        <div className="py-12 text-center">
          <p className="text-sm text-muted">Trusted by 2,000+ growing teams</p>
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {customerLogos.map((name) => (
              <li key={name} className="font-display text-lg font-bold tracking-tight text-subtle">
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
