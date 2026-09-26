import { NODE_H, NODE_W, nodeMeta, portsFor } from "./nodes";
import type { FlowEdge, FlowNode, NodeType, Port, RunRecord, WorkflowDoc, WorkflowStats } from "./types";

let counter = 0;
export const flowId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}`;

export const GRID = 10;
export const snap = (n: number) => Math.round(n / GRID) * GRID;

export function createNode(type: NodeType, x: number, y: number): FlowNode {
  const { title, config } = nodeMeta[type].defaults;
  return { id: flowId("nd"), type, title, x: snap(x), y: snap(y), config: { ...config } };
}

export function templateDoc(): WorkflowDoc {
  const n = (id: string, type: NodeType, title: string, x: number, y: number, config?: Record<string, string>): FlowNode => ({
    id,
    type,
    title,
    x,
    y,
    config: { ...nodeMeta[type].defaults.config, ...config },
  });
  return {
    name: "Inbound lead routing",
    status: "active",
    nodes: [
      n("n_trigger", "trigger", "New lead", -120, 0),
      n("n_ai", "ai", "AI qualification", -120, 150),
      n("n_check", "condition", "Check score", -120, 300),
      n("n_assign", "crm", "Assign owner", -290, 470),
      n("n_email", "communication", "Send email", -290, 620, { template: "Welcome · book a demo" }),
      n("n_task", "task", "Create task", -290, 770, { task: "Intro call", due: "today" }),
      n("n_nurture", "communication", "Nurture", 50, 470, { channel: "sequence", template: "5-email nurture series" }),
    ],
    edges: [
      { id: "e_1", from: "n_trigger", port: "out", to: "n_ai" },
      { id: "e_2", from: "n_ai", port: "out", to: "n_check" },
      { id: "e_3", from: "n_check", port: "yes", to: "n_assign" },
      { id: "e_4", from: "n_check", port: "no", to: "n_nurture" },
      { id: "e_5", from: "n_assign", port: "out", to: "n_email" },
      { id: "e_6", from: "n_email", port: "out", to: "n_task" },
    ],
  };
}

export function seedStats(leadNames: string[], now = Date.now()): WorkflowStats {
  const minutes = [14, 52, 97, 180, 260, 410];
  const history: RunRecord[] = minutes.map((m, i) => {
    const branch = i % 3 === 1 ? "no" : "yes";
    return {
      id: flowId("run"),
      at: now - m * 60_000,
      ok: i !== 4,
      durationMs: 1800 + ((i * 733) % 2400),
      lead: leadNames[i % Math.max(1, leadNames.length)] ?? "New lead",
      branch,
      steps: branch === "yes" ? 6 : 4,
    };
  });
  return { runs: 1284, successes: 1251, lastRunAt: history[0].at, history };
}

/* Reducer ------------------------------------------------------------------ */

export type DocAction =
  | { type: "rename"; name: string }
  | { type: "status"; status: WorkflowDoc["status"] }
  | { type: "node/add"; node: FlowNode; edge?: FlowEdge }
  | { type: "node/move"; id: string; x: number; y: number }
  | { type: "node/update"; id: string; title?: string; config?: Record<string, string> }
  | { type: "node/delete"; id: string }
  | { type: "restore"; nodes: FlowNode[]; edges: FlowEdge[] }
  | { type: "edge/add"; edge: FlowEdge }
  | { type: "edge/delete"; id: string }
  | { type: "replace"; doc: WorkflowDoc };

export function docReducer(doc: WorkflowDoc, action: DocAction): WorkflowDoc {
  switch (action.type) {
    case "rename":
      return { ...doc, name: action.name };
    case "status":
      return { ...doc, status: action.status };
    case "node/add":
      return {
        ...doc,
        nodes: [...doc.nodes, action.node],
        edges: action.edge ? [...doc.edges, action.edge] : doc.edges,
      };
    case "node/move":
      return {
        ...doc,
        nodes: doc.nodes.map((n) => (n.id === action.id ? { ...n, x: action.x, y: action.y } : n)),
      };
    case "node/update":
      return {
        ...doc,
        nodes: doc.nodes.map((n) =>
          n.id === action.id
            ? { ...n, title: action.title ?? n.title, config: action.config ? { ...n.config, ...action.config } : n.config }
            : n,
        ),
      };
    case "node/delete":
      return {
        ...doc,
        nodes: doc.nodes.filter((n) => n.id !== action.id),
        edges: doc.edges.filter((e) => e.from !== action.id && e.to !== action.id),
      };
    case "restore":
      return {
        ...doc,
        nodes: [...doc.nodes, ...action.nodes.filter((n) => !doc.nodes.some((m) => m.id === n.id))],
        edges: [...doc.edges, ...action.edges.filter((e) => !doc.edges.some((f) => f.id === e.id))],
      };
    case "edge/add":
      return {
        ...doc,
        edges: [...doc.edges.filter((e) => !(e.from === action.edge.from && e.port === action.edge.port)), action.edge],
      };
    case "edge/delete":
      return { ...doc, edges: doc.edges.filter((e) => e.id !== action.id) };
    case "replace":
      return action.doc;
  }
}

/* Rules -------------------------------------------------------------------- */

function reachable(doc: WorkflowDoc, from: string, target: string) {
  const seen = new Set<string>();
  const stack = [from];
  while (stack.length) {
    const id = stack.pop()!;
    if (id === target) return true;
    if (seen.has(id)) continue;
    seen.add(id);
    doc.edges.filter((e) => e.from === id).forEach((e) => stack.push(e.to));
  }
  return false;
}

export type ConnectResult = { ok: true; replaced: boolean } | { ok: false; reason: string };

export function checkConnection(doc: WorkflowDoc, from: string, port: Port, to: string): ConnectResult {
  const target = doc.nodes.find((n) => n.id === to);
  if (!target) return { ok: false, reason: "Drop the connection on a node." };
  if (from === to) return { ok: false, reason: "A step can't connect to itself." };
  if (target.type === "trigger") return { ok: false, reason: "Triggers start a workflow, so they can't have inputs." };
  if (doc.edges.some((e) => e.from === from && e.port === port && e.to === to)) {
    return { ok: false, reason: "Those steps are already connected." };
  }
  if (reachable(doc, to, from)) return { ok: false, reason: "That connection would create a loop." };
  return { ok: true, replaced: doc.edges.some((e) => e.from === from && e.port === port) };
}

export function findFreeSpot(doc: WorkflowDoc, x: number, y: number) {
  let spot = { x: snap(x), y: snap(y) };
  const overlaps = (p: { x: number; y: number }) =>
    doc.nodes.some((n) => Math.abs(n.x - p.x) < NODE_W - 20 && Math.abs(n.y - p.y) < NODE_H + 20);
  for (let i = 0; i < 12 && overlaps(spot); i++) spot = { x: spot.x, y: spot.y + 150 };
  return spot;
}

export function freePort(doc: WorkflowDoc, node: FlowNode): Port | null {
  return portsFor(node.type).find((p) => !doc.edges.some((e) => e.from === node.id && e.port === p)) ?? null;
}

export type Issue = { id: string; message: string; nodeId?: string };

export function workflowIssues(doc: WorkflowDoc): Issue[] {
  const issues: Issue[] = [];
  const triggers = doc.nodes.filter((n) => n.type === "trigger");
  if (triggers.length === 0) issues.push({ id: "no-trigger", message: "Add a trigger so the workflow knows when to start." });
  if (triggers.length > 1) issues.push({ id: "many-triggers", message: "Only one trigger runs; remove the extras." });
  doc.nodes.forEach((n) => {
    if (n.type !== "trigger" && !doc.edges.some((e) => e.to === n.id)) {
      issues.push({ id: `orphan-${n.id}`, message: `“${n.title}” isn't connected to a previous step.`, nodeId: n.id });
    }
    if (n.type === "condition") {
      const missing = portsFor("condition").filter((p) => !doc.edges.some((e) => e.from === n.id && e.port === p));
      if (missing.length) issues.push({ id: `branch-${n.id}`, message: `“${n.title}” has no ${missing.join(" or ")} branch.`, nodeId: n.id });
    }
    if (n.type === "webhook" && !/^https?:\/\/\S+\.\S+/.test(n.config.url ?? "")) {
      issues.push({ id: `url-${n.id}`, message: `“${n.title}” needs a valid URL.`, nodeId: n.id });
    }
  });
  return issues;
}

/** Walks the graph from the trigger the way a real run would, taking one branch at each condition. */
export function tracePath(doc: WorkflowDoc, score: number) {
  const trigger = doc.nodes.find((n) => n.type === "trigger");
  const nodes: string[] = [];
  const edges: string[] = [];
  let branch: "yes" | "no" | null = null;
  let current = trigger;
  const seen = new Set<string>();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    nodes.push(current.id);
    let port: Port = "out";
    if (current.type === "condition") {
      const threshold = Number(current.config.value) || 0;
      const op = current.config.operator;
      const pass = current.config.field !== "score" ? true : op === "lte" ? score <= threshold : op === "eq" ? score === threshold : score >= threshold;
      port = pass ? "yes" : "no";
      branch ??= port;
    }
    const edge = doc.edges.find((e) => e.from === current!.id && e.port === port);
    if (!edge) break;
    edges.push(edge.id);
    current = doc.nodes.find((n) => n.id === edge.to);
  }
  return { nodes, edges, branch };
}
