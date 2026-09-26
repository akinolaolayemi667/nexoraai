import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions";
import { MobileNav, Sidebar } from "@/components/dashboard/sidebar";
import { getPlan } from "@/lib/data";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await getSession();
  if (!session) redirect("/login");
  const plan = getPlan(session.plan);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-white/5 px-6">
          <div className="text-sm text-zinc-400">
            Welcome back, <span className="font-medium text-white">{session.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/billing"
              className="hidden rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200 sm:block"
            >
              {plan.name} plan
            </Link>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-sm font-semibold text-white">
              {session.name.charAt(0).toUpperCase()}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </div>
        </header>
        <MobileNav />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
