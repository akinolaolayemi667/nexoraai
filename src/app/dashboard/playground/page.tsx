import type { Metadata } from "next";
import { Playground } from "@/components/dashboard/playground";
import { PageHeader } from "@/components/dashboard/stat-card";
import { getTool, tools, type Tool } from "@/lib/data";
import { getWorkspace } from "@/lib/session";

export const metadata: Metadata = { title: "Playground" };

export default async function PlaygroundPage({
  searchParams,
}: PageProps<"/dashboard/playground">) {
  const [{ tool: requested }, workspace] = await Promise.all([searchParams, getWorkspace()]);
  const myTools = workspace.map(getTool).filter((t): t is Tool => Boolean(t));
  const available = myTools.length > 0 ? myTools : tools.filter((t) => t.price === 0);
  const initial =
    (typeof requested === "string" && getTool(requested)?.slug) || available[0]?.slug;

  const options = [...available];
  const requestedTool = typeof requested === "string" ? getTool(requested) : undefined;
  if (requestedTool && !options.some((t) => t.slug === requestedTool.slug)) {
    options.unshift(requestedTool);
  }

  return (
    <>
      <PageHeader
        title="Playground"
        description="Chat with any tool in your workspace. Responses stream in real time."
      />
      <Playground
        key={initial}
        tools={options.map(({ slug, name, tagline, samplePrompts, gradient, initials }) => ({
          slug,
          name,
          tagline,
          samplePrompts,
          gradient,
          initials,
        }))}
        initialSlug={initial}
      />
    </>
  );
}
