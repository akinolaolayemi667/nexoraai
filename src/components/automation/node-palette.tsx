import { GripVertical } from "lucide-react";
import { cn } from "@/lib/cn";
import { nodeMeta, nodeOrder } from "@/lib/automation/nodes";
import type { NodeType } from "@/lib/automation/types";
import { NODE_MIME } from "./flow-canvas";

export function NodePalette({ onAdd, targetLabel }: { onAdd: (type: NodeType) => void; targetLabel: string | null }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-4 pb-2 pt-4">
        <h2 className="text-sm font-semibold text-ink">Steps</h2>
        <p className="mt-0.5 text-xs text-muted">
          {targetLabel ? (
            <>
              Click to add after <span className="font-medium text-ink">{targetLabel}</span>, or drag onto the canvas.
            </>
          ) : (
            "Click to add, or drag onto the canvas."
          )}
        </p>
      </div>
      <ul className="scrollbar-thin min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {nodeOrder.map((type) => {
          const meta = nodeMeta[type];
          const Icon = meta.icon;
          return (
            <li key={type}>
              <button
                type="button"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(NODE_MIME, type);
                  event.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => onAdd(type)}
                className="group flex w-full cursor-grab items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:border-border hover:bg-white hover:shadow-xs active:cursor-grabbing"
              >
                <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset [&_svg]:size-4", meta.chip)}>
                  <Icon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">{meta.label}</span>
                  <span className="block truncate text-xs text-muted">{meta.description}</span>
                </span>
                <GripVertical className="size-4 shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
