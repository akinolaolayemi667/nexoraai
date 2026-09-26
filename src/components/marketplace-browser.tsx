"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ToolCard } from "./tool-card";
import { categories, tools } from "@/lib/data";

const sorts = {
  popular: "Most popular",
  rating: "Top rated",
  priceLow: "Price: low to high",
  priceHigh: "Price: high to low",
} as const;

type Sort = keyof typeof sorts;

export function MarketplaceBrowser({
  initialCategory,
  initialQuery,
}: {
  initialCategory: string;
  initialQuery: string;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<Sort>("popular");
  const [freeOnly, setFreeOnly] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = tools.filter(
      (t) =>
        (category === "All" || t.category === category) &&
        (!freeOnly || t.price === 0) &&
        (!q ||
          t.name.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          t.creator.toLowerCase().includes(q)),
    );
    return filtered.sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "priceLow") return a.price - b.price;
      if (sort === "priceHigh") return b.price - a.price;
      return b.users - a.users;
    });
  }, [category, query, sort, freeOnly]);

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, creators…"
            className="input pl-10"
            aria-label="Search tools"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
              className="h-4 w-4 accent-violet-500"
            />
            Free only
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="input w-auto"
            aria-label="Sort tools"
          >
            {Object.entries(sorts).map(([value, label]) => (
              <option key={value} value={value} className="bg-zinc-900">
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              category === c
                ? "bg-violet-500 text-white"
                : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-zinc-500">
        {results.length} {results.length === 1 ? "tool" : "tools"} found
      </p>

      {results.length > 0 ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="card mt-4 p-12 text-center text-zinc-400">
          No tools match your filters. Try a different search.
        </div>
      )}
    </div>
  );
}
