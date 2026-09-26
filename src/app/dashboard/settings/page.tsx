import type { Metadata } from "next";
import { updateProfile } from "@/app/actions";
import { PageHeader } from "@/components/dashboard/stat-card";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <>
      <PageHeader title="Settings" description="Manage your profile and account preferences." />
      <form action={updateProfile} className="card max-w-2xl space-y-6 p-6">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm text-zinc-300">
            Display name
          </label>
          <input id="name" name="name" defaultValue={session.name} className="input" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-zinc-300">
            Email
          </label>
          <input id="email" value={session.email} disabled className="input opacity-60" />
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <input
            type="checkbox"
            name="creator"
            defaultChecked={session.role === "creator"}
            className="mt-0.5 h-4 w-4 accent-violet-500"
          />
          <span>
            <span className="block text-sm font-medium text-white">Creator mode</span>
            <span className="block text-sm text-zinc-400">
              Unlock the Creator Studio to publish AI tools and earn 80% of revenue.
            </span>
          </span>
        </label>
        <button type="submit" className="btn-primary">
          Save changes
        </button>
      </form>
    </>
  );
}
