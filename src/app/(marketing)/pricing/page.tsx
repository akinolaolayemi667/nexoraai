import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { plans } from "@/lib/data";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for individuals and teams.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white sm:text-5xl">
          Simple, <span className="text-gradient">transparent</span> pricing
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          Start free and upgrade as your AI usage grows. Every plan includes access
          to the full marketplace.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card relative flex flex-col p-8 ${
              plan.highlighted ? "border-violet-400/50 bg-violet-500/[0.06]" : ""
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-8 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-3 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
            )}
            <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
            <p className="mt-1 text-sm text-zinc-400">{plan.description}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">${plan.price}</span>
              <span className="text-zinc-500">/month</span>
            </div>
            <ul className="mt-8 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href={`/signup?plan=${plan.id}`}
              className={`mt-8 ${plan.highlighted ? "btn-primary" : "btn-secondary"}`}
            >
              {plan.price === 0 ? "Get started free" : `Choose ${plan.name}`}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
