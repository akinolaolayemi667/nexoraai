import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Play, Plus, Save, Settings2, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";
import { useCrm } from "@/lib/crm/crm-context";
import { NODE_H, NODE_W, nodeMeta, nodeOrder } from "@/lib/automation/nodes";
import type { FlowEdge, FlowNode, NodeType, Port, Selection } from "@/lib/automation/types";
import { useWorkflow } from "@/lib/automation/use-workflow";
import {
  checkConnection,
  createNode,
  findFreeSpot,
  flowId,
  freePort,
  snap,
  tracePath,
  workflowIssues,
} from "@/lib/automation/workflow";
import { useNow } from "@/hooks/use-now";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Badge, Button, Drawer, Dropdown, Tooltip, useToast } from "@/components/ui";
import { FlowCanvas, type FlowCanvasHandle, type RunHighlight } from "@/components/automation/flow-canvas";
import { NodePalette } from "@/components/automation/node-palette";
import { statusMetaFor, WorkflowSidebar, type SidebarTab } from "@/components/automation/workflow-sidebar";

const STEP_MS = 550;
const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

export default function AutomationsPage() {
  const now = useNow(30_000);
  const { toast } = useToast();
  const { state } = useCrm();
  const { doc, dispatch, dirty, save, savedAt, stats, recordRun } = useWorkflow();
  const [selection, setSelection] = useState<Selection>(null);
  const [tab, setTab] = useState<SidebarTab>("workflow");
  const [run, setRun] = useState<RunHighlight | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const canvasRef = useRef<FlowCanvasHandle>(null);
  const settings = useDisclosure();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const issues = useMemo(() => workflowIssues(doc), [doc]);
  const selectedNode = selection?.kind === "node" ? (doc.nodes.find((n) => n.id === selection.id) ?? null) : null;
  const running = run !== null;

  const select = useCallback((next: Selection) => {
    setSelection(next);
    if (next?.kind === "node") setTab("step");
    else if (next === null) setTab((t) => (t === "step" ? "workflow" : t));
  }, []);

  const selectNode = useCallback((id: string) => select({ kind: "node", id }), [select]);

  /* Editing ---------------------------------------------------------------- */

  const guardTrigger = (type: NodeType) => {
    const existing = doc.nodes.find((n) => n.type === "trigger");
    if (type === "trigger" && existing) {
      toast({ title: "This workflow already has a trigger", description: "Edit the existing trigger instead.", variant: "warning" });
      selectNode(existing.id);
      return false;
    }
    return true;
  };

  const addNode = (type: NodeType) => {
    if (!guardTrigger(type)) return;
    let node: FlowNode;
    let edge: FlowEdge | undefined;
    if (selectedNode) {
      const port = type === "trigger" ? null : freePort(doc, selectedNode);
      const offset = port === "yes" ? -170 : port === "no" ? 170 : 0;
      const spot = findFreeSpot(doc, selectedNode.x + offset, selectedNode.y + 150);
      node = createNode(type, spot.x, spot.y);
      if (port) edge = { id: flowId("ed"), from: selectedNode.id, port, to: node.id };
    } else {
      const center = canvasRef.current?.viewportCenter() ?? { x: 0, y: 0 };
      const spot = findFreeSpot(doc, center.x - NODE_W / 2, center.y - NODE_H / 2);
      node = createNode(type, spot.x, spot.y);
    }
    dispatch({ type: "node/add", node, edge });
    selectNode(node.id);
    canvasRef.current?.reveal(node);
  };

  const dropNode = (type: NodeType, x: number, y: number) => {
    if (!guardTrigger(type)) return;
    const node = createNode(type, x, y);
    dispatch({ type: "node/add", node });
    selectNode(node.id);
  };

  const connect = (from: string, port: Port, to: string) => {
    const result = checkConnection(doc, from, port, to);
    if (!result.ok) {
      toast({ title: "Can't connect those steps", description: result.reason, variant: "warning" });
      return;
    }
    dispatch({ type: "edge/add", edge: { id: flowId("ed"), from, port, to } });
    if (result.replaced) toast({ title: "Connection replaced", description: "Each output connects to one next step." });
  };

  const deleteNode = useCallback(
    (id: string) => {
      const node = doc.nodes.find((n) => n.id === id);
      if (!node || running) return;
      const edges = doc.edges.filter((e) => e.from === id || e.to === id);
      dispatch({ type: "node/delete", id });
      select(null);
      settings.close();
      toast({
        title: `Deleted “${node.title}”`,
        description: edges.length ? `${edges.length} ${edges.length === 1 ? "connection" : "connections"} removed.` : undefined,
        action: { label: "Undo", onClick: () => dispatch({ type: "restore", nodes: [node], edges }) },
      });
    },
    [doc, running, dispatch, select, settings, toast],
  );

  const deleteEdge = useCallback(
    (id: string) => {
      const edge = doc.edges.find((e) => e.id === id);
      if (!edge || running) return;
      dispatch({ type: "edge/delete", id });
      select(null);
      toast({
        title: "Connection removed",
        action: { label: "Undo", onClick: () => dispatch({ type: "restore", nodes: [], edges: [edge] }) },
      });
    },
    [doc.edges, running, dispatch, select, toast],
  );

  const duplicateNode = (id: string) => {
    const source = doc.nodes.find((n) => n.id === id);
    if (!source || !guardTrigger(source.type)) return;
    const spot = findFreeSpot(doc, source.x + 40, source.y + 40);
    const node = { ...source, id: flowId("nd"), title: `${source.title} copy`.slice(0, 40), x: snap(spot.x), y: snap(spot.y), config: { ...source.config } };
    dispatch({ type: "node/add", node });
    selectNode(node.id);
    canvasRef.current?.reveal(node);
  };

  const addTrigger = () => {
    const first = [...doc.nodes].sort((a, b) => a.y - b.y)[0];
    const spot = findFreeSpot(doc, first ? first.x : -NODE_W / 2, first ? first.y - 150 : 0);
    const node = createNode("trigger", spot.x, spot.y);
    const edge = first ? { id: flowId("ed"), from: node.id, port: "out" as const, to: first.id } : undefined;
    dispatch({ type: "node/add", node, edge });
    selectNode(node.id);
    canvasRef.current?.reveal(node);
  };

  const saveWorkflow = useCallback(() => {
    save();
    setJustSaved(true);
    window.setTimeout(() => mounted.current && setJustSaved(false), 1600);
    const blocking = issues.length;
    toast({
      title: "Workflow saved",
      description: blocking ? `Saved with ${blocking} ${blocking === 1 ? "check" : "checks"} to review before it runs reliably.` : "Stored in this browser for your account.",
      variant: blocking ? "warning" : "success",
    });
  }, [save, issues.length, toast]);

  /* Test run --------------------------------------------------------------- */

  const testRun = async () => {
    if (running) return;
    if (!doc.nodes.some((n) => n.type === "trigger")) {
      toast({ title: "Add a trigger first", description: "Test runs start from the trigger step.", variant: "warning" });
      return;
    }
    const pool = state.leads.filter((l) => l.status === "new" || l.status === "contacted");
    const lead = (pool.length ? pool : state.leads)[Math.floor(Math.random() * Math.max(1, pool.length || state.leads.length))];
    const score = lead?.score ?? 72;
    const path = tracePath(doc, score);
    select(null);
    const started = Date.now();
    const done = new Set<string>();
    const traversed = new Set<string>();
    for (let i = 0; i < path.nodes.length; i++) {
      if (i > 0) traversed.add(path.edges[i - 1]);
      setRun({ active: path.nodes[i], nodes: new Set(done), edges: new Set(traversed) });
      await sleep(STEP_MS);
      if (!mounted.current) return;
      done.add(path.nodes[i]);
    }
    setRun({ active: null, nodes: new Set(done), edges: new Set(traversed) });
    const failedAt = path.nodes
      .map((id) => doc.nodes.find((n) => n.id === id))
      .find((n) => n?.type === "webhook" && !/^https?:\/\/\S+\.\S+/.test(n.config.url ?? ""));
    const ok = !failedAt;
    recordRun({
      id: flowId("run"),
      at: Date.now(),
      ok,
      durationMs: Date.now() - started,
      lead: lead?.name ?? "Sample lead",
      branch: path.branch,
      steps: path.nodes.length,
      test: true,
    });
    toast({
      title: ok ? "Test run completed" : `Test run failed at “${failedAt!.title}”`,
      description: ok
        ? `${lead?.name ?? "A sample lead"} (score ${score})${path.branch ? ` took the ${path.branch === "yes" ? "Yes" : "No"} path` : ""} through ${path.nodes.length} steps. Simulated only; nothing was sent.`
        : "Add a valid URL to the webhook step and try again.",
      variant: ok ? "success" : "error",
    });
    await sleep(1400);
    if (mounted.current) setRun(null);
  };

  /* Keyboard ---------------------------------------------------------------- */

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveWorkflow();
        return;
      }
      if (isTyping(event.target) || document.querySelector("[role=dialog]")) return;
      if (event.key === "Escape") select(null);
      if ((event.key === "Delete" || event.key === "Backspace") && selection) {
        event.preventDefault();
        if (selection.kind === "node") deleteNode(selection.id);
        else deleteEdge(selection.id);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saveWorkflow, select, selection, deleteNode, deleteEdge]);

  const status = statusMetaFor(doc.status);
  const saveLabel = dirty ? "Unsaved changes" : savedAt ? `Saved ${formatRelative(savedAt, now).toLowerCase()}` : "All changes saved";

  const sidebar = (
    <WorkflowSidebar
      tab={tab}
      onTabChange={setTab}
      doc={doc}
      dispatch={dispatch}
      stats={stats}
      issues={issues}
      now={now}
      selectedNode={selectedNode}
      onSelectNode={selectNode}
      onDeleteNode={deleteNode}
      onDuplicateNode={duplicateNode}
      onAddTrigger={addTrigger}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-white px-3 sm:gap-3 sm:px-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-semibold text-ink">Automation Builder</h1>
            <Badge variant={doc.status === "active" ? "success" : doc.status === "paused" ? "warning" : "neutral"} dot className="hidden sm:inline-flex">
              {status.label}
            </Badge>
          </div>
          <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted">
            <span className="truncate">{doc.name}</span>
            <span aria-hidden className="hidden sm:inline">
              ·
            </span>
            <span className={cn("flex shrink-0 items-center gap-1", dirty && "text-warning-text")} title={saveLabel}>
              {dirty && <span className="size-1.5 rounded-full bg-warning" aria-hidden />}
              <span className="hidden sm:inline">{saveLabel}</span>
              {dirty && <span className="sr-only sm:hidden">{saveLabel}</span>}
            </span>
          </p>
        </div>

        <Dropdown
          align="end"
          width="w-60"
          className="lg:hidden"
          trigger={({ open, ...props }) => (
            <Button {...props} variant="secondary" size="sm" leftIcon={<Plus />} className={cn(open && "bg-sunken")} aria-label="Add step">
              <span className="hidden sm:inline">Add step</span>
            </Button>
          )}
          items={nodeOrder.map((type) => {
            const meta = nodeMeta[type];
            const Icon = meta.icon;
            return { label: meta.label, description: meta.description, icon: <Icon />, onSelect: () => addNode(type) };
          })}
        />
        <Tooltip content="Workflow settings">
          <Button variant="secondary" size="icon-sm" className="xl:hidden" onClick={() => { setTab(selectedNode ? "step" : "workflow"); settings.open(); }} aria-label="Workflow settings">
            <Settings2 />
          </Button>
        </Tooltip>
        <Button variant="secondary" size="sm" leftIcon={<Play />} loading={running} onClick={testRun} aria-label="Test run">
          <span className="hidden sm:inline">{running ? "Running…" : "Test run"}</span>
        </Button>
        <Tooltip content="Save workflow" shortcut="Ctrl S">
          <Button size="sm" leftIcon={<Save />} success={justSaved} onClick={saveWorkflow} aria-label="Save workflow">
            <span className="hidden sm:inline">Save workflow</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </Tooltip>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-canvas lg:flex">
          <NodePalette onAdd={addNode} targetLabel={selectedNode?.title ?? null} />
        </aside>

        <div className="relative flex min-w-0 flex-1 flex-col">
          <FlowCanvas
            ref={canvasRef}
            doc={doc}
            selection={selection}
            run={run}
            onSelect={select}
            onMoveNode={(id, x, y) => dispatch({ type: "node/move", id, x, y })}
            onConnect={connect}
            onDeleteEdge={deleteEdge}
            onDropNode={dropNode}
          />
          {selectedNode && (
            <div data-canvas-ui className="absolute inset-x-3 bottom-14 flex items-center gap-2 rounded-xl border border-border bg-white p-2 pl-3 shadow-lg xl:hidden">
              <span className="min-w-0 flex-1">
                <span className="block text-2xs font-medium uppercase tracking-wider text-subtle">{nodeMeta[selectedNode.type].label}</span>
                <span className="block truncate text-sm font-semibold text-ink">{selectedNode.title}</span>
              </span>
              <Button size="sm" variant="secondary" leftIcon={<Pencil />} onClick={() => { setTab("step"); settings.open(); }}>
                Edit
              </Button>
              <Button size="icon-sm" variant="ghost" onClick={() => deleteNode(selectedNode.id)} aria-label={`Delete ${selectedNode.title}`}>
                <Trash2 />
              </Button>
            </div>
          )}
        </div>

        <aside className="hidden w-80 shrink-0 flex-col border-l border-border bg-white xl:flex">{sidebar}</aside>
      </div>

      <Drawer open={settings.isOpen} onClose={settings.close} title="Workflow settings" size="sm">
        <div className="-mx-6 -my-5 flex h-[calc(100%+2.5rem)] flex-col">{sidebar}</div>
      </Drawer>
    </div>
  );
}
