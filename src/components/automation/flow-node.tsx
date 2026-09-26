import { memo, type KeyboardEvent, type PointerEvent } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { NODE_H, NODE_W, nodeMeta, portsFor } from "@/lib/automation/nodes";
import type { FlowNode, Port } from "@/lib/automation/types";

type FlowNodeViewProps = {
  node: FlowNode;
  selected: boolean;
  run: "active" | "done" | null;
  linkTarget: boolean;
  connectedPorts: Port[];
  onBodyPointerDown: (event: PointerEvent, node: FlowNode) => void;
  onPortPointerDown: (event: PointerEvent, node: FlowNode, port: Port) => void;
  onKeySelect: (node: FlowNode) => void;
};

const portX: Record<Port, string> = { out: "left-1/2", yes: "left-[30%]", no: "left-[70%]" };

export const FlowNodeView = memo(function FlowNodeView({
  node,
  selected,
  run,
  linkTarget,
  connectedPorts,
  onBodyPointerDown,
  onPortPointerDown,
  onKeySelect,
}: FlowNodeViewProps) {
  const meta = nodeMeta[node.type];
  const Icon = meta.icon;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onKeySelect(node);
    }
  };

  return (
    <div
      data-node-id={node.id}
      role="button"
      tabIndex={0}
      aria-label={`${meta.label}: ${node.title}`}
      aria-pressed={selected}
      onPointerDown={(e) => onBodyPointerDown(e, node)}
      onKeyDown={onKeyDown}
      style={{ left: node.x, top: node.y, width: NODE_W, height: NODE_H }}
      className={cn(
        "group absolute cursor-grab touch-none select-none rounded-xl border bg-white outline-none transition-[box-shadow,border-color] duration-150 active:cursor-grabbing",
        selected ? "border-primary shadow-[0_0_0_3px_rgb(37_99_235/0.18),var(--shadow-md)]" : "border-border shadow-sm hover:border-border-strong hover:shadow-md",
        linkTarget && "border-primary shadow-[0_0_0_4px_rgb(37_99_235/0.22)]",
        run === "active" && "border-success shadow-[0_0_0_4px_rgb(22_163_74/0.22)]",
        run === "done" && !selected && "border-success-border",
        "focus-visible:border-primary focus-visible:shadow-focus",
      )}
    >
      <span className="absolute inset-y-3 left-0 w-[3px] rounded-r-full" style={{ backgroundColor: meta.color }} aria-hidden />
      <div className="flex h-full items-start gap-3 py-3 pl-4 pr-3">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset [&_svg]:size-4", meta.chip)}>
          <Icon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-subtle">{meta.label}</p>
          <p className="truncate text-sm font-semibold text-ink">{node.title}</p>
          <p className="truncate text-xs text-muted">{meta.summary(node.config)}</p>
        </div>
        {run && (
          <span
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-full text-white [&_svg]:size-3",
              run === "active" ? "animate-pulse bg-success/70" : "bg-success",
            )}
            aria-label={run === "active" ? "Running" : "Completed"}
          >
            <Check />
          </span>
        )}
      </div>

      {node.type !== "trigger" && (
        <span
          className={cn(
            "pointer-events-none absolute left-1/2 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ring-1 transition-colors",
            linkTarget ? "bg-primary ring-primary" : "bg-border-strong ring-border-strong",
          )}
          aria-hidden
        />
      )}

      {portsFor(node.type).map((port) => {
        const connected = connectedPorts.includes(port);
        return (
          <span key={port} className={cn("absolute bottom-0 -translate-x-1/2 translate-y-1/2", portX[port])}>
            <span
              data-port={port}
              onPointerDown={(e) => onPortPointerDown(e, node, port)}
              title={port === "out" ? "Drag to connect" : `Drag to connect the ${port === "yes" ? "Yes" : "No"} branch`}
              className="group/port flex size-6 cursor-crosshair items-center justify-center rounded-full"
            >
              <span
                className={cn(
                  "size-3 rounded-full border-2 border-white ring-1 transition-transform duration-150 group-hover/port:scale-150",
                  connected ? "ring-transparent" : "ring-border-strong",
                )}
                style={{ backgroundColor: connected ? (port === "no" ? "#94a3b8" : meta.color) : "white" }}
              />
            </span>
            {port !== "out" && !connected && (
              <span
                className={cn(
                  "pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap text-2xs font-semibold",
                  port === "yes" ? "text-success-text" : "text-muted",
                )}
              >
                {port === "yes" ? "Yes" : "No"}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
});
