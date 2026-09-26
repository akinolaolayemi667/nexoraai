import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, Star, TrendingUp, Users } from "lucide-react";
import { BarChart } from "@/components/dashboard/charts";
import { PublishToolForm } from "@/components/dashboard/publish-tool-form";
import { PageHeader, StatCard } from "@/components/dashboard/stat-card";
import { ToolIcon } from "@/components/tool-card";
import { categories, creatorRevenueLast6Months, formatNumber, formatPrice, tools } from "@/lib/data";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Creator studio" };

export default async function CreatorPage() {
  const session = await getSession();

  if (session?.role !== "creator") {
    return (
      <>
        <PageHeader title="Creator studio" description="Publish AI tools and earn recurring revenue." />
        <div className="card mx-auto max-w-xl p-10 text-center">
          <h2 className="text-xl font-semibold text-white">Become a NexoraAI creator</h2>
          <p className="mt-3 text-sm text-zinc-400">
            Publish your AI tools to thousands of paying customers and keep 80% of
            subscription revenue. Turn on creator mode in your settings to get started.
          </p>
          <Link href="/dashboard/settings" className="btn-primary mt-6">
            Enable creator mode
          </Link>
        </div>
      </>
    );
  }

  const myListings = tools.filter((t) => t.creator === "Nexora Studio" || t.creator === "Quanta AI");
  const revenue = creatorRevenueLast6Months.at(-1)!.value;

  return (
    <>
      <PageHeader title="Creator studio" description="Manage your listings, revenue and payouts." />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (Sep)" value={`$${revenue.toLocaleString()}`} change="+21.8% MoM" icon={DollarSign} />
        <StatCard label="Subscribers" value="3,482" change="+312 this month" icon={Users} />
        <StatCard label="Avg. rating" value="4.7" icon={Star} />
        <StatCard label="Conversion" value="6.4%" change="+0.9 pts" icon={TrendingUp} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="card p-6 xl:col-span-2">
          <h2 className="font-semibold text-white">Revenue</h2>
          <p className="text-sm text-zinc-400">Your 80% share, last 6 months</p>
          <div className="mt-6">
            <BarChart
              data={creatorRevenueLast6Months.map((d) => ({ label: d.month, value: d.value }))}
            />
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-white">Next payout</h2>
          <p className="text-sm text-zinc-400">Scheduled for Oct 1, 2026</p>
          <div className="mt-6 text-3xl font-bold text-white">${revenue.toLocaleString()}</div>
          <p className="mt-2 text-xs text-zinc-500">Paid to bank account ending 4821</p>
        </div>
      </div>

      <div className="card mt-6 overflow-x-auto p-6">
        <h2 className="font-semibold text-white">Your listings</h2>
        <table className="mt-4 w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase text-zinc-500">
            <tr>
              <th className="pb-3 font-medium">Tool</th>
              <th className="pb-3 font-medium">Price</th>
              <th className="pb-3 font-medium">Users</th>
              <th className="pb-3 font-medium">Rating</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {myListings.map((t) => (
              <tr key={t.slug}>
                <td className="py-3">
                  <Link href={`/marketplace/${t.slug}`} className="flex items-center gap-3 text-white hover:text-violet-200">
                    <ToolIcon tool={t} size="sm" />
                    {t.name}
                  </Link>
                </td>
                <td className="py-3 text-zinc-300">{formatPrice(t.price)}</td>
                <td className="py-3 text-zinc-300">{formatNumber(t.users)}</td>
                <td className="py-3 text-zinc-300">{t.rating}</td>
                <td className="py-3">
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">
                    Live
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="font-semibold text-white">Publish a new tool</h2>
        <p className="text-sm text-zinc-400">
          Describe your tool and its system prompt. Our team reviews submissions within 48 hours.
        </p>
        <PublishToolForm categories={categories} />
      </div>
    </>
  );
}
