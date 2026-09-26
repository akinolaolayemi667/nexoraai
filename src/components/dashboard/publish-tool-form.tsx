"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function PublishToolForm({ categories }: { categories: string[] }) {
  const [submitted, setSubmitted] = useState<string | null>(null);

  if (submitted) {
    return (
      <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <span>
          <strong>{submitted}</strong> was submitted for review. We&apos;ll email you once it&apos;s live.
        </span>
        <button onClick={() => setSubmitted(null)} className="ml-auto text-xs underline">
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(String(new FormData(e.currentTarget).get("name")));
      }}
      className="mt-6 grid gap-4 md:grid-cols-2"
    >
      <div>
        <label className="mb-1.5 block text-sm text-zinc-300" htmlFor="tool-name">Tool name</label>
        <input id="tool-name" name="name" required className="input" placeholder="e.g. PitchPerfect" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-zinc-300" htmlFor="tool-category">Category</label>
        <select id="tool-category" name="category" className="input">
          {categories.map((c) => (
            <option key={c} className="bg-zinc-900">{c}</option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="mb-1.5 block text-sm text-zinc-300" htmlFor="tool-tagline">Tagline</label>
        <input id="tool-tagline" name="tagline" required className="input" placeholder="One sentence that sells your tool" />
      </div>
      <div className="md:col-span-2">
        <label className="mb-1.5 block text-sm text-zinc-300" htmlFor="tool-prompt">System prompt</label>
        <textarea
          id="tool-prompt"
          name="prompt"
          required
          rows={4}
          className="input resize-y"
          placeholder="You are PitchPerfect, an expert at writing investor pitch decks…"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-zinc-300" htmlFor="tool-price">Monthly price (USD)</label>
        <input id="tool-price" name="price" type="number" min={0} defaultValue={9} className="input" />
      </div>
      <div className="flex items-end">
        <button type="submit" className="btn-primary w-full">Submit for review</button>
      </div>
    </form>
  );
}
