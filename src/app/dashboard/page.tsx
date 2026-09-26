import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowRight, Clock, Coins, Wrench } from "lucide-react";
import { AreaChart, Meter } from "@/components/dashboard/charts";
import { PageHeader, StatCard } from "@/components/dashboard/stat-card";
import { ToolIcon } from "@/components/tool-card";
import { getPlan, getTool, recentActivity, usageLast14Days, type Tool } from "@/lib/data";
import { getSession, getWorkspace } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [session, workspace] = await Promise.all([getSession(), getWorkspace()]);
  const plan = getPlan(session?.plan);
  const myTools = workspace.map(getTool).filter((t): t is Tool => Boolean(t));
  const creditsUsed = Math.min(plan.credits, usageLast14Days.reduce((a, b) => a + b, 0) / 4);
  const totalTasks = usageLast14Days.reduce((a, b) => a + b, 0);

  return (
    <>
      <PageHeader title="Overview" description="Your AI activity at a glance.">
        <Link href="/marketplace" className="btn-primary">
          Discover tools
        </Link>
      </PageHeader>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tasks this period" value={totalTasks.toLocaleString()} change="+24% vs last period" icon={Activity} />
        <StatCard label="Credits used" value={`${Math.round(creditsUsed).toLocaleString()}`} change={`of ${plan.credits.toLocaleString()} on ${plan.name}`} icon={Coins} />
        <StatCard label="Active tools" value={myTools.length.toString()} icon={Wrench} />
        <StatCard label="Hours saved" value="46.5" change="+8.2 this week" icon={Clock} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="card p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">Usage</h2>
              <p className="text-sm text-zinc-400">AI tasks over the last 14 days</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
              Trending up
            </span>
          </div>
          <div className="mt-6">
            <AreaChart data={usageLast14Days} />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-white">Credit balance</h2>
          <p className="text-sm text-zinc-400">Resets on the 1st of each month</p>
          <div className="mt-6 text-3xl font-bold text-white">
            {(plan.credits - Math.round(creditsUsed)).toLocaleString()}
            <span className="ml-1 text-base font-normal text-zinc-500">left</span>
          </div>
          <div className="mt-4">
            <Meter value={creditsUsed} max={plan.credits} />
          </div>
          <Link href="/dashboard/billing" className="btn-secondary mt-6 w-full">
            Manage plan
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Your workspace</h2>
            <Link href="/dashboard/tools" className="text-sm text-violet-300 hover:text-violet-200">
              Manage
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {myTools.length === 0 && (
              <p className="py-6 text-center text-sm text-zinc-400">
                No tools yet. <Link href="/marketplace" className="text-violet-300">Browse the marketplace</Link>.
              </p>
            )}
            {myTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/dashboard/playground?tool=${tool.slug}`}
                className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-white/5"
              >
                <ToolIcon tool={tool} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white">{tool.name}</div>
                  <div className="truncate text-xs text-zinc-500">{tool.tagline}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-500" />
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-white">Recent activity</h2>
          <ul className="mt-4 divide-y divide-white/5">
            {recentActivity.map((a) => (
              <li key={a.action} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm text-white">{a.action}</div>
                  <div className="text-xs text-zinc-500">
                    {a.tool} · {a.time}
                  </div>
                </div>
                <span className="text-xs text-zinc-400">{a.credits} credits</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
