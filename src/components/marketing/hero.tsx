import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, PlayCircle, Sparkles, Target, UserCheck, Zap } from "lucide-react";
import { routes } from "@/lib/routes";
import { glassScaleIn, staggerGlass } from "@/lib/motion";
import { customerLogos } from "@/data/marketing";
import { FadeIn, Sparkline, Stagger, StaggerItem, buttonVariants } from "@/components/ui";
import { DashboardPreview } from "./dashboard-preview";

const ctaText = "text-xs font-semibold uppercase tracking-wider";

const revenueTrend = [52, 55, 54, 60, 58, 64, 69, 67, 74, 78, 76, 84];

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute left-1/2 top-[-14rem] h-[44rem] w-[80rem] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(37_99_235/0.32),transparent)]" />
      <div className="absolute right-[-16rem] top-[30rem] h-[36rem] w-[48rem] bg-[radial-gradient(closest-side,rgb(79_70_229/0.26),transparent)]" />
      <div className="absolute left-[-18rem] top-[40rem] h-[32rem] w-[44rem] bg-[radial-gradient(closest-side,rgb(124_58_237/0.18),transparent)]" />
      <div className="absolute inset-x-0 top-0 h-[44rem] bg-grid opacity-70 [mask-image:radial-gradient(ellipse_60%_65%_at_50%_0%,black,transparent)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white to-transparent" />
    </div>
  );
}

function FloatingCards() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 hidden xl:block"
      variants={staggerGlass(0.12, 0.7)}
      initial="hidden"
      animate="visible"
      aria-hidden
    >
      <motion.div variants={glassScaleIn} className="glass-strong absolute -left-14 top-32 w-56 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <span className="type-overline text-muted">Revenue</span>
          <span className="inline-flex items-center gap-0.5 rounded-md bg-success-soft px-1.5 py-0.5 font-mono text-2xs font-medium text-success-text">
            <ArrowUpRight className="size-3" />
            12.8%
          </span>
        </div>
        <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-ink">$84,250</p>
        <Sparkline data={revenueTrend} className="mt-2 h-10 w-full" />
      </motion.div>

      <motion.div variants={glassScaleIn} className="glass-strong absolute -right-12 top-16 w-60 rounded-2xl p-4">
        <div className="grid grid-cols-2 divide-x divide-hairline">
          <div className="pr-3">
            <span className="flex items-center gap-1.5 text-2xs font-medium text-muted">
              <Target className="size-3 text-primary" />
              New leads
            </span>
            <p className="mt-1.5 font-mono text-xl font-semibold text-ink">248</p>
            <p className="font-mono text-2xs text-success-text">+18.4%</p>
          </div>
          <div className="pl-3">
            <span className="flex items-center gap-1.5 text-2xs font-medium text-muted">
              <UserCheck className="size-3 text-accent" />
              Qualified
            </span>
            <p className="mt-1.5 font-mono text-xl font-semibold text-ink">126</p>
            <p className="font-mono text-2xs text-success-text">+9.2%</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={glassScaleIn} className="glass-strong absolute -right-16 top-[44%] w-52 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-ai text-white shadow-glow-ai">
            <Zap className="size-3.5" />
          </span>
          <span className="type-overline text-muted">AI tasks</span>
        </div>
        <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-ink">184</p>
        <p className="text-2xs text-muted">completed automatically this month</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-accent-soft">
          <div className="h-full w-[78%] rounded-full bg-gradient-ai" />
        </div>
      </motion.div>

      <motion.div variants={glassScaleIn} className="glass-ai absolute -left-10 bottom-24 w-72 rounded-2xl p-4 backdrop-blur-xl">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-accent-hover">
          <Sparkles className="size-3.5" />
          AI Insight
        </p>
        <p className="mt-2 text-sm font-medium leading-snug text-ink">12 high-intent leads need follow-up today.</p>
        <p className="mt-3 inline-flex items-center gap-1 text-2xs font-semibold uppercase tracking-wider text-primary">
          Review leads
          <ArrowRight className="size-3" />
        </p>
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <HeroBackdrop />

      <div className="relative mx-auto max-w-6xl px-6 pt-14 sm:pt-20">
        <Stagger className="mx-auto flex max-w-3xl flex-col items-center text-center" stagger={0.07}>
          <StaggerItem>
            <span className="glass-strong inline-flex items-center gap-2 rounded-full px-3 py-1 text-2xs font-semibold uppercase tracking-wider text-primary-active shadow-glass!">
              <span className="flex size-4 items-center justify-center rounded-full bg-gradient-ai text-white">
                <Sparkles className="size-2.5" aria-hidden />
              </span>
              AI-powered business operations
            </span>
          </StaggerItem>
          <StaggerItem>
            <h1 className="mt-7 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-[4rem] lg:leading-[1.05]">
              Run Your Business
              <br />
              <span className="text-gradient-ai">With Intelligence Built In.</span>
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              Manage leads, automate workflows, understand your customers and move your business forward from one
              intelligent workspace.
            </p>
          </StaggerItem>
          <StaggerItem>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Link to={routes.signup} className={buttonVariants({ size: "lg", className: `${ctaText} h-11 px-6` })}>
                Start free
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                to="/#product"
                className={buttonVariants({ variant: "secondary", size: "lg", className: `${ctaText} h-11 px-6` })}
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

        <FadeIn preset="glassReveal" delay={0.35} className="relative mt-14 sm:mt-20">
          <div
            className="pointer-events-none absolute inset-x-[8%] -top-10 bottom-1/3 bg-[radial-gradient(closest-side,rgb(37_99_235/0.22),transparent)]"
            aria-hidden
          />
          <div className="glass relative rounded-[1.75rem] p-1.5 shadow-[0_0_0_1px_rgb(148_163_184/0.18),0_50px_100px_-40px_rgb(30_64_175/0.35),0_20px_50px_rgb(15_23_42/0.08)] sm:p-2.5">
            <DashboardPreview />
          </div>
          <FloatingCards />
        </FadeIn>

        <div className="py-14 text-center">
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
