export type NodeType = "trigger" | "ai" | "condition" | "crm" | "communication" | "task" | "delay" | "webhook";

export type Port = "out" | "yes" | "no";

export type FlowNode = {
  id: string;
  type: NodeType;
  title: string;
  x: number;
  y: number;
  config: Record<string, string>;
};

export type FlowEdge = { id: string; from: string; port: Port; to: string };

export type WorkflowStatus = "active" | "paused" | "draft";

export type WorkflowDoc = {
  name: string;
  status: WorkflowStatus;
  nodes: FlowNode[];
  edges: FlowEdge[];
};

export type RunRecord = {
  id: string;
  at: number;
  ok: boolean;
  durationMs: number;
  lead: string;
  branch: "yes" | "no" | null;
  steps: number;
  test?: boolean;
};

export type WorkflowStats = {
  runs: number;
  successes: number;
  lastRunAt: number | null;
  history: RunRecord[];
};

export type Selection = { kind: "node"; id: string } | { kind: "edge"; id: string } | null;
