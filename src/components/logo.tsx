import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold text-white">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500">
        <Sparkles className="h-4 w-4" />
      </span>
      <span className="text-lg tracking-tight">
        Nexora<span className="text-gradient">AI</span>
      </span>
    </Link>
  );
}
