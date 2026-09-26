export type AiAction =
  | { id: string; kind: "navigate"; label: string; href: string; primary?: boolean }
  | { id: string; kind: "followups"; label: string; leadIds: string[]; primary?: boolean }
  | { id: string; kind: "prompt"; label: string; prompt: string; primary?: boolean };

export type AiBlock =
  | { type: "leads"; leadIds: string[] }
  | { type: "deals"; dealIds: string[] }
  | { type: "contact"; leadId: string }
  | { type: "steps"; items: { title: string; detail: string; tone?: "risk" | "action" | "idea" }[] }
  | { type: "draft"; subject: string; body: string };

export type Attachment = { id: string; name: string; size: number; type: string };

export type AiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  at: number;
  blocks?: AiBlock[];
  actions?: AiAction[];
  attachments?: Attachment[];
  completedActions?: string[];
  stopped?: boolean;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: AiMessage[];
};

export type AiReply = Pick<AiMessage, "content" | "blocks" | "actions">;
