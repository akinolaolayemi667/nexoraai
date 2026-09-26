import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/stat-card";
import { ToolIcon } from "@/components/tool-card";
import { WorkspaceButton } from "@/components/workspace-button";
import { formatPrice, getTool, type Tool } from "@/lib/data";
import { getWorkspace } from "@/lib/session";

export const metadata: Metadata = { title: "My tools" };

export default async function MyToolsPage() {
  const workspace = await getWorkspace();
  const myTools = workspace.map(getTool).filter((t): t is Tool => Boolean(t));
  const monthly = myTools.reduce((sum, t) => sum + t.price, 0);

  return (
    <>
      <PageHeader
        title="My tools"
        description={`${myTools.length} tools in your workspace · $${monthly}/mo in tool subscriptions`}
      >
        <Link href="/marketplace" className="btn-primary">
          Add more tools
        </Link>
      </PageHeader>

      {myTools.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-zinc-400">Your workspace is empty.</p>
          <Link href="/marketplace" className="btn-primary mt-6">
            Explore the marketplace
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {myTools.map((tool) => (
            <div key={tool.slug} className="card flex flex-col p-6">
              <div className="flex items-center gap-4">
                <ToolIcon tool={tool} />
                <div>
                  <Link
                    href={`/marketplace/${tool.slug}`}
                    className="font-semibold text-white hover:text-violet-200"
                  >
                    {tool.name}
                  </Link>
                  <div className="text-xs text-zinc-500">
                    {tool.category} · {formatPrice(tool.price)}
                  </div>
                </div>
              </div>
              <p className="mt-4 flex-1 text-sm text-zinc-400">{tool.tagline}</p>
              <div className="mt-6 flex gap-3">
                <Link
                  href={`/dashboard/playground?tool=${tool.slug}`}
                  className="btn-primary flex-1"
                >
                  Open
                </Link>
                <WorkspaceButton slug={tool.slug} added compact />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
