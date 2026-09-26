import type { Metadata } from "next";
import { Check } from "lucide-react";
import { changePlan } from "@/app/actions";
import { Meter } from "@/components/dashboard/charts";
import { PageHeader } from "@/components/dashboard/stat-card";
import { getPlan, getTool, invoices, plans, usageLast14Days, type Tool } from "@/lib/data";
import { getSession, getWorkspace } from "@/lib/session";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const [session, workspace] = await Promise.all([getSession(), getWorkspace()]);
  const current = getPlan(session?.plan);
  const toolSpend = workspace
    .map(getTool)
    .filter((t): t is Tool => Boolean(t))
    .reduce((sum, t) => sum + t.price, 0);
  const creditsUsed = Math.min(current.credits, usageLast14Days.reduce((a, b) => a + b, 0) / 4);

  return (
    <>
      <PageHeader title="Billing" description="Manage your plan, usage and invoices." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <p className="text-sm text-zinc-400">Current plan</p>
          <div className="mt-2 text-2xl font-bold text-white">{current.name}</div>
          <p className="mt-1 text-sm text-zinc-400">${current.price}/month</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-zinc-400">Credits used</p>
          <div className="mt-2 text-2xl font-bold text-white">
            {Math.round(creditsUsed).toLocaleString()} / {current.credits.toLocaleString()}
          </div>
          <div className="mt-4">
            <Meter value={creditsUsed} max={current.credits} />
          </div>
        </div>
        <div className="card p-6">
          <p className="text-sm text-zinc-400">Estimated next invoice</p>
          <div className="mt-2 text-2xl font-bold text-white">${current.price + toolSpend}</div>
          <p className="mt-1 text-sm text-zinc-400">
            Plan ${current.price} + tool subscriptions ${toolSpend}
          </p>
        </div>
      </div>

      <h2 className="mb-4 mt-10 text-lg font-semibold text-white">Change plan</h2>
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const active = plan.id === current.id;
          return (
            <div
              key={plan.id}
              className={`card flex flex-col p-6 ${active ? "border-violet-400/50 bg-violet-500/[0.06]" : ""}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{plan.name}</h3>
                <span className="text-white">
                  ${plan.price}
                  <span className="text-sm text-zinc-500">/mo</span>
                </span>
              </div>
              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" /> {f}
                  </li>
                ))}
              </ul>
              <form action={changePlan} className="mt-6">
                <input type="hidden" name="plan" value={plan.id} />
                <button
                  type="submit"
                  disabled={active}
                  className={`w-full ${active ? "btn-secondary" : "btn-primary"}`}
                >
                  {active ? "Current plan" : plan.price > current.price ? "Upgrade" : "Downgrade"}
                </button>
              </form>
            </div>
          );
        })}
      </div>

      <div className="card mt-10 overflow-x-auto p-6">
        <h2 className="font-semibold text-white">Invoices</h2>
        <table className="mt-4 w-full min-w-[480px] text-left text-sm">
          <thead className="text-xs uppercase text-zinc-500">
            <tr>
              <th className="pb-3 font-medium">Invoice</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="py-3 font-mono text-xs text-zinc-300">{inv.id}</td>
                <td className="py-3 text-zinc-300">{inv.date}</td>
                <td className="py-3 text-zinc-300">${inv.amount.toFixed(2)}</td>
                <td className="py-3">
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
