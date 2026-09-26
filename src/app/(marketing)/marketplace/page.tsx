import type { Metadata } from "next";
import { MarketplaceBrowser } from "@/components/marketplace-browser";
import { categories, type Category } from "@/lib/data";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Browse AI tools for writing, coding, marketing, data, design and productivity.",
};

export default async function MarketplacePage({
  searchParams,
}: PageProps<"/marketplace">) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : "";
  const q = typeof params.q === "string" ? params.q : "";

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <h1 className="text-4xl font-bold text-white">AI Marketplace</h1>
      <p className="mt-3 max-w-2xl text-zinc-400">
        Discover tools built by the NexoraAI community. Add any tool to your
        workspace and run it from your dashboard.
      </p>
      <MarketplaceBrowser
        initialCategory={categories.includes(category as Category) ? category : "All"}
        initialQuery={q}
      />
    </div>
  );
}
