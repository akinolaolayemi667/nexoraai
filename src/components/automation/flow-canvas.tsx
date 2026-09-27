import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Maximize2, MousePointerClick, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { NODE_H, NODE_W, portPosition } from "@/lib/automation/nodes";
import type { FlowEdge, FlowNode, NodeType, Port, Selection, WorkflowDoc } from "@/lib/automation/types";
import { snap } from "@/lib/automation/workflow";
import { Button, Tooltip } from "@/components/ui";
import { FlowNodeView } from "./flow-node";

export const NODE_MIME = "application/x-nexora-node";

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.75;
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

type View = { x: number; y: number; zoom: number };
type Point = { x: number; y: number };

type Drag =
  | { kind: "pan"; sx: number; sy: number; vx: number; vy: number; moved: boolean }
  | { kind: "node"; id: string; sx: number; sy: number; ox: number; oy: number; moved: boolean }
  | { kind: "link"; from: string; port: Port };

type Link = { from: string; port: Port; x: number; y: number; target: string | null };

export type RunHighlight = { active: string | null; nodes: Set<string>; edges: Set<string> };

export type FlowCanvasHandle = {
  fitView: () => void;
  zoomBy: (factor: number) => void;
  viewportCenter: () => Point;
  reveal: (p: Point) => void;
};

type FlowCanvasProps = {
  doc: WorkflowDoc;
  selection: Selection;
  run: RunHighlight | null;
  onSelect: (selection: Selection) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onConnect: (from: string, port: Port, to: string) => void;
  onDeleteEdge: (id: string) => void;
  onDropNode: (type: NodeType, x: number, y: number) => void;
};

function curve(s: Point, t: Point) {
  const dy = Math.max(48, Math.abs(t.y - s.y) / 2);
  const c1 = { x: s.x, y: s.y + dy };
  const c2 = { x: t.x, y: t.y - dy };
  const mid = {
    x: (s.x + 3 * c1.x + 3 * c2.x + t.x) / 8,
    y: (s.y + 3 * c1.y + 3 * c2.y + t.y) / 8,
  };
  return { d: `M ${s.x} ${s.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${t.x} ${t.y}`, mid };
}

const edgeColors = { idle: "#a5b4fc", selected: "#4f46e5", run: "#16a34a", link: "#2563eb" };

export const FlowCanvas = forwardRef<FlowCanvasHandle, FlowCanvasProps>(function FlowCanvas(
  { doc, selection, run, onSelect, onMoveNode, onConnect, onDeleteEdge, onDropNode },
  ref,
) {
  const markerId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ x: 0, y: 0, zoom: 1 });
  const viewRef = useRef(view);
  const dragRef = useRef<Drag | null>(null);
  const [link, setLink] = useState<Link | null>(null);
  const [panning, setPanning] = useState(false);
  const latest = useRef({ doc, onSelect, onMoveNode, onConnect });
  latest.current = { doc, onSelect, onMoveNode, onConnect };

  const updateView = useCallback((fn: (v: View) => View) => {
    const next = fn(viewRef.current);
    viewRef.current = next;
    setView(next);
  }, []);

  const toWorld = useCallback((clientX: number, clientY: number): Point => {
    const rect = containerRef.current!.getBoundingClientRect();
    const v = viewRef.current;
    return { x: (clientX - rect.left - v.x) / v.zoom, y: (clientY - rect.top - v.y) / v.zoom };
  }, []);

  const fitView = useCallback(() => {
    const el = containerRef.current;
    const nodes = latest.current.doc.nodes;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (nodes.length === 0) {
      updateView(() => ({ x: w / 2, y: h / 3, zoom: 1 }));
      return;
    }
    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + NODE_W));
    const maxY = Math.max(...nodes.map((n) => n.y + NODE_H)) + 24;
    const pad = w < 640 ? 24 : 56;
    const zoom = clampZoom(Math.min(1, (w - pad * 2) / (maxX - minX), (h - pad * 2) / (maxY - minY)));
    updateView(() => ({
      zoom,
      x: (w - (maxX - minX) * zoom) / 2 - minX * zoom,
      y: (h - (maxY - minY) * zoom) / 2 - minY * zoom,
    }));
  }, [updateView]);

  const zoomAt = useCallback(
    (factor: number, px: number, py: number) => {
      updateView((v) => {
        const zoom = clampZoom(v.zoom * factor);
        const k = zoom / v.zoom;
        return { zoom, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
      });
    },
    [updateView],
  );

  const zoomBy = useCallback(
    (factor: number) => {
      const el = containerRef.current;
      if (el) zoomAt(factor, el.clientWidth / 2, el.clientHeight / 2);
    },
    [zoomAt],
  );

  useImperativeHandle(
    ref,
    () => ({
      fitView,
      zoomBy,
      viewportCenter: () => {
        const el = containerRef.current;
        const v = viewRef.current;
        if (!el) return { x: 0, y: 0 };
        return { x: (el.clientWidth / 2 - v.x) / v.zoom, y: (el.clientHeight / 2 - v.y) / v.zoom };
      },
      reveal: (p) => {
        const el = containerRef.current;
        if (!el) return;
        const margin = 48;
        updateView((v) => {
          const left = p.x * v.zoom + v.x;
          const top = p.y * v.zoom + v.y;
          const right = left + NODE_W * v.zoom;
          const bottom = top + (NODE_H + 24) * v.zoom;
          let { x, y } = v;
          if (left < margin) x += margin - left;
          else if (right > el.clientWidth - margin) x -= right - (el.clientWidth - margin);
          if (top < margin) y += margin - top;
          else if (bottom > el.clientHeight - margin) y -= bottom - (el.clientHeight - margin);
          return x === v.x && y === v.y ? v : { ...v, x, y };
        });
      },
    }),
    [fitView, zoomBy, updateView],
  );

  useLayoutEffect(() => {
    fitView();
  }, [fitView]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.shiftKey) {
        updateView((v) => ({ ...v, x: v.x - event.deltaY, y: v.y - event.deltaX }));
        return;
      }
      const rect = el.getBoundingClientRect();
      zoomAt(Math.exp(-event.deltaY * (event.ctrlKey ? 0.01 : 0.0015)), event.clientX - rect.left, event.clientY - rect.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt, updateView]);

  const hitNode = useCallback((p: Point, exclude: string) => {
    return (
      latest.current.doc.nodes.find(
        (n) => n.id !== exclude && p.x >= n.x - 12 && p.x <= n.x + NODE_W + 12 && p.y >= n.y - 12 && p.y <= n.y + NODE_H + 12,
      )?.id ?? null
    );
  }, []);

  const begin = useCallback(
    (drag: Drag) => {
      dragRef.current = drag;
      const move = (event: PointerEvent) => {
        const d = dragRef.current;
        if (!d) return;
        if (d.kind === "pan") {
          const dx = event.clientX - d.sx;
          const dy = event.clientY - d.sy;
          if (!d.moved && Math.hypot(dx, dy) < 3) return;
          if (!d.moved) setPanning(true);
          d.moved = true;
          updateView((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy }));
        } else if (d.kind === "node") {
          const dx = event.clientX - d.sx;
          const dy = event.clientY - d.sy;
          if (!d.moved && Math.hypot(dx, dy) < 3) return;
          d.moved = true;
          const z = viewRef.current.zoom;
          latest.current.onMoveNode(d.id, snap(d.ox + dx / z), snap(d.oy + dy / z));
        } else {
          const p = toWorld(event.clientX, event.clientY);
          setLink({ from: d.from, port: d.port, x: p.x, y: p.y, target: hitNode(p, d.from) });
        }
      };
      const up = (event: PointerEvent) => {
        const d = dragRef.current;
        dragRef.current = null;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        setPanning(false);
        if (!d) return;
        if (d.kind === "pan" && !d.moved && event.type === "pointerup") latest.current.onSelect(null);
        if (d.kind === "link") {
          const target = hitNode(toWorld(event.clientX, event.clientY), d.from);
          if (target && event.type === "pointerup") latest.current.onConnect(d.from, d.port, target);
          setLink(null);
        }
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    },
    [hitNode, toWorld, updateView],
  );

  const onBackgroundPointerDown = (event: ReactPointerEvent) => {
    if (event.button !== 0 && event.button !== 1) return;
    if ((event.target as HTMLElement).closest("[data-node-id],[data-canvas-ui],[data-edge]")) return;
    event.preventDefault();
    containerRef.current?.focus({ preventScroll: true });
    const v = viewRef.current;
    begin({ kind: "pan", sx: event.clientX, sy: event.clientY, vx: v.x, vy: v.y, moved: false });
  };

  const onBodyPointerDown = useCallback(
    (event: ReactPointerEvent, node: FlowNode) => {
      if (event.button !== 0) return;
      event.stopPropagation();
      latest.current.onSelect({ kind: "node", id: node.id });
      begin({ kind: "node", id: node.id, sx: event.clientX, sy: event.clientY, ox: node.x, oy: node.y, moved: false });
    },
    [begin],
  );

  const onPortPointerDown = useCallback(
    (event: ReactPointerEvent, node: FlowNode, port: Port) => {
      if (event.button !== 0) return;
      event.stopPropagation();
      event.preventDefault();
      const start = portPosition(node, port);
      setLink({ from: node.id, port, x: start.x, y: start.y + 40, target: null });
      begin({ kind: "link", from: node.id, port });
    },
    [begin],
  );

  const onKeySelect = useCallback((node: FlowNode) => latest.current.onSelect({ kind: "node", id: node.id }), []);

  const onDragOver = (event: DragEvent) => {
    if (!event.dataTransfer.types.includes(NODE_MIME)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const onDrop = (event: DragEvent) => {
    const type = event.dataTransfer.getData(NODE_MIME) as NodeType;
    if (!type) return;
    event.preventDefault();
    const p = toWorld(event.clientX, event.clientY);
    onDropNode(type, p.x - NODE_W / 2, p.y - NODE_H / 2);
  };

  const nodeById = new Map(doc.nodes.map((n) => [n.id, n]));
  const selectedEdge = selection?.kind === "edge" ? doc.edges.find((e) => e.id === selection.id) : undefined;

  const edgeGeometry = (edge: FlowEdge) => {
    const from = nodeById.get(edge.from);
    const to = nodeById.get(edge.to);
    if (!from || !to) return null;
    const s = portPosition(from, edge.port);
    const t = portPosition(to, "in");
    return { s, ...curve(s, { x: t.x, y: t.y - 7 }) };
  };

  const linkFrom = link ? nodeById.get(link.from) : undefined;
  const linkTarget = link?.target ? nodeById.get(link.target) : undefined;
  const linkPath =
    link && linkFrom
      ? curve(portPosition(linkFrom, link.port), linkTarget ? { ...portPosition(linkTarget, "in"), y: linkTarget.y - 7 } : { x: link.x, y: link.y }).d
      : null;

  const selectedGeometry = selectedEdge ? edgeGeometry(selectedEdge) : null;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      onPointerDown={onBackgroundPointerDown}
      onDragOver={onDragOver}
      onDrop={onDrop}
      aria-label="Workflow canvas"
      className={cn(
        "relative min-h-0 flex-1 touch-none overflow-hidden bg-canvas bg-grid outline-none",
        panning ? "cursor-grabbing" : link ? "cursor-crosshair" : "cursor-grab",
      )}
      style={{
        backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1.2px)",
        backgroundSize: `${20 * view.zoom}px ${20 * view.zoom}px`,
        backgroundPosition: `${view.x}px ${view.y}px`,
      }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}
      >
        <svg
          className="pointer-events-none absolute left-0 top-0 overflow-visible"
          width={1}
          height={1}
          role="group"
          aria-label="Connections"
        >
          <defs>
            {Object.entries(edgeColors).map(([key, color]) => (
              <marker
                key={key}
                id={`${markerId}-${key}`}
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto"
              >
                <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill={color} />
              </marker>
            ))}
          </defs>
          {doc.edges.map((edge) => {
            const g = edgeGeometry(edge);
            if (!g) return null;
            const selected = selectedEdge?.id === edge.id;
            const ran = run?.edges.has(edge.id) ?? false;
            const tone = selected ? "selected" : ran ? "run" : "idle";
            return (
              <g key={edge.id}>
                <path
                  data-edge
                  d={g.d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={16}
                  className="pointer-events-auto cursor-pointer outline-none focus-visible:stroke-primary/20"
                  tabIndex={0}
                  role="button"
                  aria-pressed={selected}
                  aria-label={`Connection from ${nodeById.get(edge.from)?.title ?? "step"}${
                    edge.port === "yes" ? " (yes)" : edge.port === "no" ? " (no)" : ""
                  } to ${nodeById.get(edge.to)?.title ?? "step"}. Press Delete to remove.`}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onSelect({ kind: "edge", id: edge.id });
                  }}
                  onFocus={() => onSelect({ kind: "edge", id: edge.id })}
                />
                <path
                  d={g.d}
                  fill="none"
                  stroke={edgeColors[tone]}
                  strokeWidth={selected || ran ? 2.25 : 1.75}
                  markerEnd={`url(#${markerId}-${tone})`}
                  strokeDasharray={ran ? "6 6" : undefined}
                  style={ran ? { animation: "flow-dash 0.6s linear infinite" } : undefined}
                  className="transition-[stroke] duration-150"
                />
              </g>
            );
          })}
          {linkPath && (
            <path d={linkPath} fill="none" stroke={edgeColors.link} strokeWidth={2} strokeDasharray="5 5" markerEnd={`url(#${markerId}-link)`} />
          )}
        </svg>

        {doc.edges
          .filter((e) => e.port !== "out")
          .map((edge) => {
            const g = edgeGeometry(edge);
            if (!g) return null;
            return (
              <span
                key={`label-${edge.id}`}
                className={cn(
                  "pointer-events-none absolute -translate-x-1/2 rounded-full px-1.5 py-px text-2xs font-semibold ring-1 ring-inset",
                  edge.port === "yes" ? "bg-success-soft text-success-text ring-success-border" : "bg-white text-muted ring-border",
                )}
                style={{ left: g.s.x, top: g.s.y + 14 }}
              >
                {edge.port === "yes" ? "Yes" : "No"}
              </span>
            );
          })}

        {doc.nodes.map((node) => (
          <FlowNodeView
            key={node.id}
            node={node}
            selected={selection?.kind === "node" && selection.id === node.id}
            run={run?.active === node.id ? "active" : run?.nodes.has(node.id) ? "done" : null}
            linkTarget={link?.target === node.id}
            connectedPorts={doc.edges.filter((e) => e.from === node.id).map((e) => e.port)}
            onBodyPointerDown={onBodyPointerDown}
            onPortPointerDown={onPortPointerDown}
            onKeySelect={onKeySelect}
          />
        ))}

        {selectedEdge && selectedGeometry && (
          <button
            type="button"
            data-canvas-ui
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDeleteEdge(selectedEdge.id)}
            className="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-muted shadow-md transition-colors hover:border-danger-border hover:text-danger"
            style={{ left: selectedGeometry.mid.x, top: selectedGeometry.mid.y }}
            aria-label="Delete connection"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {doc.nodes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          <div className="max-w-xs rounded-xl border border-dashed border-border-strong bg-white/80 p-6 text-center backdrop-blur-sm">
            <MousePointerClick className="mx-auto size-5 text-subtle" />
            <p className="mt-2 text-sm font-medium text-ink">Start with a trigger</p>
            <p className="mt-1 text-xs text-muted">Add a step from the palette, or drag one onto the canvas.</p>
          </div>
        </div>
      )}

      <div
        data-canvas-ui
        className="glass-strong absolute bottom-3 left-3 flex items-center gap-0.5 rounded-xl p-0.5"
      >
        <Tooltip content="Zoom out">
          <Button variant="ghost" size="icon-xs" onClick={() => zoomBy(1 / 1.2)} disabled={view.zoom <= MIN_ZOOM + 0.001} aria-label="Zoom out">
            <ZoomOut />
          </Button>
        </Tooltip>
        <Tooltip content="Reset to 100%">
          <button
            type="button"
            onClick={() => zoomBy(1 / view.zoom)}
            className="w-12 rounded-md py-1 text-center font-mono text-2xs tabular-nums text-muted transition-colors hover:bg-sunken hover:text-ink"
            aria-label={`Zoom ${Math.round(view.zoom * 100)}%, reset to 100%`}
          >
            {Math.round(view.zoom * 100)}%
          </button>
        </Tooltip>
        <Tooltip content="Zoom in">
          <Button variant="ghost" size="icon-xs" onClick={() => zoomBy(1.2)} disabled={view.zoom >= MAX_ZOOM - 0.001} aria-label="Zoom in">
            <ZoomIn />
          </Button>
        </Tooltip>
        <span className="mx-0.5 h-4 w-px bg-border" aria-hidden />
        <Tooltip content="Fit to screen">
          <Button variant="ghost" size="icon-xs" onClick={fitView} aria-label="Fit to screen">
            <Maximize2 />
          </Button>
        </Tooltip>
      </div>

      <p
        data-canvas-ui
        className="pointer-events-none absolute right-3 top-3 hidden rounded-md bg-white/85 px-2 py-1 text-2xs text-muted ring-1 ring-border backdrop-blur-sm md:block"
      >
        Drag to pan · Scroll to zoom · Drag from a port to connect
      </p>
    </div>
  );
});
