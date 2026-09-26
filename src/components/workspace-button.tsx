"use client";

import { useTransition } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import { toggleWorkspaceTool } from "@/app/actions";

export function WorkspaceButton({
  slug,
  added,
  compact = false,
}: {
  slug: string;
  added: boolean;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const Icon = pending ? Loader2 : added ? Check : Plus;
  const label = added ? (compact ? "Remove" : "In your workspace") : "Add to workspace";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleWorkspaceTool(slug))}
      className={added ? "btn-secondary" : "btn-primary"}
    >
      <Icon className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />
      {label}
    </button>
  );
}
