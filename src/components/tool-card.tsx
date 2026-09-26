import Link from "next/link";
import { Star, Users } from "lucide-react";
import { formatNumber, formatPrice, type Tool } from "@/lib/data";

export function ToolIcon({ tool, size = "md" }: { tool: Tool; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-9 w-9 text-xs rounded-lg",
    md: "h-12 w-12 text-sm rounded-xl",
    lg: "h-16 w-16 text-lg rounded-2xl",
  };
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-gradient-to-br font-bold text-white ${tool.gradient} ${sizes[size]}`}
    >
      {tool.initials}
    </span>
  );
}

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/marketplace/${tool.slug}`}
      className="card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-white/[0.05]"
    >
      <div className="flex items-start justify-between gap-3">
        <ToolIcon tool={tool} />
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            tool.price === 0
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-violet-500/10 text-violet-300"
          }`}
        >
          {formatPrice(tool.price)}
        </span>
      </div>
      <h3 className="mt-4 font-semibold text-white group-hover:text-violet-200">
        {tool.name}
      </h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-zinc-400">{tool.tagline}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <span className="rounded-md bg-white/5 px-2 py-1">{tool.category}</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {tool.rating}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {formatNumber(tool.users)}
          </span>
        </span>
      </div>
    </Link>
  );
}
