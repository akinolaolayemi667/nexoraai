import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Code2,
  Database,
  Megaphone,
  Palette,
  PenLine,
  Rocket,
  ShieldCheck,
  Store,
  Wallet,
  Zap,
} from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { categories, tools, type Category } from "@/lib/data";

const categoryIcons: Record<Category, React.ElementType> = {
  Writing: PenLine,
  Coding: Code2,
  Marketing: Megaphone,
  Data: Database,
  Design: Palette,
  Productivity: Zap,
};

const stats = [
  { value: "250k+", label: "Active users" },
  { value: "1,200+", label: "AI tools" },
  { value: "38M", label: "Tasks completed" },
  { value: "$4.2M", label: "Paid to creators" },
];

const steps = [
  {
    icon: Store,
    title: "Discover",
    body: "Browse a curated marketplace of AI tools for writing, code, data, design and more.",
  },
  {
    icon: Bot,
    title: "Run from one dashboard",
    body: "Add tools to your workspace and run them side by side with a single credit balance.",
  },
  {
    icon: BarChart3,
    title: "Measure impact",
    body: "Track usage, spend and time saved across every tool with built-in analytics.",
  },
];

const faqs = [
  {
    q: "How do credits work?",
    a: "Every plan includes monthly AI credits shared across all tools in your workspace. Premium tools also have their own subscription set by the creator.",
  },
  {
    q: "Can I publish my own AI tool?",
    a: "Yes. Switch on creator mode in settings, open the Creator Studio, and submit your tool. You keep 80% of subscription revenue.",
  },
  {
    q: "Which AI models power the tools?",
    a: "Creators choose the underlying model. NexoraAI routes requests to leading providers and handles billing, auth and scaling.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Plans are month-to-month and you can downgrade to the free Starter plan whenever you like.",
  },
];

export default function Home() {
  const featured = tools.filter((t) => t.featured);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-24 text-center md:pt-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-300">
            <Rocket className="h-3.5 w-3.5 text-cyan-300" />
            New: Creator Studio with 80% revenue share
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Every AI tool you need.
            <br />
            <span className="text-gradient">One powerful dashboard.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            NexoraAI is the marketplace where teams discover, subscribe to and run
            best-in-class AI tools — and where creators turn their AI into recurring
            revenue.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn-primary px-7 py-3">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/marketplace" className="btn-secondary px-7 py-3">
              Explore marketplace
            </Link>
          </div>
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-white md:text-3xl">{s.value}</div>
                <div className="mt-1 text-sm text-zinc-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Featured tools</h2>
            <p className="mt-2 text-zinc-400">Hand-picked by our team this week.</p>
          </div>
          <Link
            href="/marketplace"
            className="hidden items-center gap-1 text-sm text-violet-300 hover:text-violet-200 sm:flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold text-white">Browse by category</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => {
            const Icon = categoryIcons[c];
            const count = tools.filter((t) => t.category === c).length;
            return (
              <Link
                key={c}
                href={`/marketplace?category=${c}`}
                className="card flex flex-col items-center gap-3 p-6 text-center transition hover:border-cyan-400/40"
              >
                <Icon className="h-6 w-6 text-cyan-300" />
                <span className="font-medium text-white">{c}</span>
                <span className="text-xs text-zinc-500">{count} tools</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">How NexoraAI works</h2>
          <p className="mt-2 text-zinc-400">From discovery to results in minutes.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="card p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15">
                  <s.icon className="h-5 w-5 text-violet-300" />
                </span>
                <span className="text-sm text-zinc-500">Step {i + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="creators" className="mx-auto max-w-7xl px-6 py-16">
        <div className="card relative overflow-hidden p-10 md:p-14">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-[100px]" />
          <div className="relative grid items-center gap-10 md:grid-cols-2">
            <div>
              <span className="text-sm font-medium text-cyan-300">For creators</span>
              <h2 className="mt-3 text-3xl font-bold text-white">
                Turn your AI into a business
              </h2>
              <p className="mt-4 text-zinc-400">
                Publish your AI tool to thousands of paying customers. We handle
                auth, billing, hosting and payouts — you keep 80% of revenue.
              </p>
              <Link href="/signup" className="btn-primary mt-8">
                Become a creator <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="space-y-4">
              {[
                { icon: Wallet, text: "80% revenue share with monthly payouts" },
                { icon: BarChart3, text: "Real-time analytics on usage and revenue" },
                { icon: ShieldCheck, text: "Built-in auth, billing and fraud protection" },
                { icon: Zap, text: "Launch in minutes with prompt-based tools" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-zinc-300">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                    <item.icon className="h-4 w-4 text-cyan-300" />
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold text-white">
          Frequently asked questions
        </h2>
        <div className="mt-10 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="card group p-5">
              <summary className="cursor-pointer list-none font-medium text-white">
                {f.q}
              </summary>
              <p className="mt-3 text-sm text-zinc-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-8">
        <div className="rounded-3xl bg-gradient-to-r from-violet-600 to-cyan-600 p-10 text-center md:p-16">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to supercharge your work with AI?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Join 250,000+ professionals using NexoraAI. Free forever on the Starter plan.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 font-semibold text-zinc-900 transition hover:bg-zinc-100"
          >
            Create free account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
