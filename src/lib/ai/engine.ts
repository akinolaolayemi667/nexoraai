import { isOpenStage, ownerFirstName, stageMeta, statusMeta } from "@/lib/crm/constants";
import { aiSummary } from "@/lib/crm/insights";
import type { CrmState, Deal, Lead } from "@/lib/crm/types";
import { formatCurrency, formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { AiAction, AiReply, Attachment } from "./types";

const HOUR = 3600_000;
const DAY = 24 * HOUR;

let actionCounter = 0;
const aid = () => `act_${Date.now().toString(36)}${(actionCounter++).toString(36)}`;

/* Shared queries (also used by the insight cards) ------------------------- */

export function followUpCandidates(state: CrmState, now: number) {
  const scheduled = new Set(state.tasks.filter((t) => !t.done && now - t.createdAt < 48 * HOUR).map((t) => t.leadId));
  return state.leads
    .filter(
      (l) =>
        (l.status === "new" || l.status === "contacted" || l.status === "qualified") &&
        l.score >= 80 &&
        now - l.lastActivityAt >= 48 * HOUR &&
        now - l.lastActivityAt <= 21 * DAY &&
        !scheduled.has(l.id),
    )
    .sort((a, b) => b.score - a.score);
}

export function staleDeals(state: CrmState, now: number) {
  return state.deals
    .filter((d) => isOpenStage(d.stage) && now - d.lastActivityAt > 7 * DAY)
    .sort((a, b) => b.value - a.value);
}

export function openPipeline(state: CrmState) {
  const open = state.deals.filter((d) => isOpenStage(d.stage));
  return {
    open,
    total: open.reduce((s, d) => s + d.value, 0),
    weighted: open.reduce((s, d) => s + (d.value * d.probability) / 100, 0),
  };
}

export function overdueTasks(state: CrmState, now: number) {
  return state.tasks.filter((t) => !t.done && t.dueAt < now);
}

export function waitingNewLeads(state: CrmState, now: number) {
  return state.leads.filter((l) => l.status === "new" && now - l.createdAt < 7 * DAY);
}

export function spotlightCustomer(state: CrmState) {
  const withDeals = new Set(state.deals.filter((d) => isOpenStage(d.stage)).map((d) => d.contactId));
  return [...state.leads]
    .filter((l) => withDeals.has(l.id))
    .sort((a, b) => b.lastActivityAt - a.lastActivityAt)[0];
}

/* Reply builders ---------------------------------------------------------- */

const names = (leads: Lead[]) =>
  leads.length === 1
    ? leads[0].name
    : `${leads
        .slice(0, -1)
        .map((l) => l.name)
        .join(", ")} and ${leads.at(-1)!.name}`;

function followUps(state: CrmState, now: number): AiReply {
  const leads = followUpCandidates(state, now);
  if (leads.length === 0) {
    return {
      content: "Good news — every high-intent lead has been contacted in the last 48 hours. Nothing is waiting on a follow-up right now.",
      actions: [{ id: aid(), kind: "prompt", label: "What should I do next?", prompt: "What should I do next?" }],
    };
  }
  const top = leads.slice(0, 3);
  return {
    content: `I found **${leads.length} high-intent ${leads.length === 1 ? "lead" : "leads"}** that ${leads.length === 1 ? "has" : "have"} not received a follow-up in the last 48 hours.\n\nThey all score 80 or higher and are still open. Start with ${names(top)} — they have the strongest buying signals.`,
    blocks: [{ type: "leads", leadIds: leads.map((l) => l.id) }],
    actions: [
      { id: aid(), kind: "navigate", label: "Review leads", href: `${routes.app.leads}?score=hot&sort=score` },
      { id: aid(), kind: "followups", label: "Create follow-up", leadIds: leads.map((l) => l.id), primary: true },
    ],
  };
}

function risks(state: CrmState, now: number): AiReply {
  const deals = staleDeals(state, now);
  if (deals.length === 0) {
    return { content: "No open deals have gone quiet — every opportunity has had activity in the last 7 days." };
  }
  const value = deals.reduce((s, d) => s + d.value, 0);
  const companies = deals.slice(0, 3).map((d) => d.company);
  const who = companies.length === 1 ? companies[0] : `${companies.slice(0, -1).join(", ")} and ${companies.at(-1)}`;
  return {
    content: `**${deals.length} open ${deals.length === 1 ? "deal" : "deals"} worth ${formatCurrency(value)}** ${deals.length === 1 ? "has" : "have"} had no calls, emails or stage changes in over a week.\n\n${deals.length > 3 ? "The largest are " : ""}${who} ${deals.length === 1 ? "is" : "are"} most at risk of slipping. A short check-in usually restarts the conversation.`,
    blocks: [{ type: "deals", dealIds: deals.map((d) => d.id) }],
    actions: [
      { id: aid(), kind: "navigate", label: "Open pipeline", href: routes.app.pipeline },
      { id: aid(), kind: "prompt", label: "Draft check-in email", prompt: `Draft a check-in email for ${deals[0].company}`, primary: true },
    ],
  };
}

function findLead(state: CrmState, text: string) {
  const t = text.toLowerCase();
  return (
    state.leads.find((l) => t.includes(l.name.toLowerCase())) ??
    state.leads.find((l) => t.includes(l.company.toLowerCase())) ??
    state.leads.find((l) => t.includes(l.name.split(" ")[0].toLowerCase()) && l.name.split(" ")[0].length > 3)
  );
}

function summary(state: CrmState, lead: Lead, now: number): AiReply {
  const deals = state.deals.filter((d) => d.contactId === lead.id);
  const open = deals.filter((d) => isOpenStage(d.stage));
  const tasks = state.tasks.filter((t) => t.leadId === lead.id && !t.done);
  const notes = state.notes.filter((n) => n.leadId === lead.id).sort((a, b) => b.createdAt - a.createdAt);
  const lines = [aiSummary(lead, open, tasks, now)];
  if (notes[0]) lines.push(`Latest note from ${notes[0].author.split(" ")[0]}: “${notes[0].body}”`);
  if (tasks.length) lines.push(`${tasks.length} open ${tasks.length === 1 ? "task" : "tasks"}, next up: ${[...tasks].sort((a, b) => a.dueAt - b.dueAt)[0].title.toLowerCase()}.`);
  return {
    content: lines.join("\n\n"),
    blocks: [{ type: "contact", leadId: lead.id }],
    actions: [
      { id: aid(), kind: "navigate", label: "Open profile", href: routes.app.lead(lead.id) },
      { id: aid(), kind: "followups", label: "Create follow-up", leadIds: [lead.id], primary: true },
    ],
  };
}

function draftEmail(state: CrmState, text: string, now: number): AiReply {
  const lead = findLead(state, text) ?? (staleDeals(state, now)[0]?.contactId ? state.leads.find((l) => l.id === staleDeals(state, now)[0].contactId) : undefined);
  if (!lead) return { content: "Who should the email go to? Mention a contact or company name and I'll draft it." };
  const deal = state.deals.find((d) => d.contactId === lead.id && isOpenStage(d.stage));
  const first = lead.name.split(" ")[0];
  return {
    content: `Here's a short check-in for ${lead.name} at ${lead.company}. It references their last activity and proposes a concrete next step.`,
    blocks: [
      {
        type: "draft",
        subject: deal ? `Next steps on ${deal.name.toLowerCase()}` : `Quick check-in from ${ownerFirstName(lead.ownerId)}`,
        body: `Hi ${first},\n\nI wanted to follow up since we last spoke${deal ? ` about ${deal.name.toLowerCase()}` : ""}. I know things get busy, so I've put together a one-page summary of what rollout would look like for ${lead.company}.\n\nWould 20 minutes on Thursday or Friday work to walk through it?\n\nBest,\n${ownerFirstName(lead.ownerId)}`,
      },
    ],
    actions: [
      { id: aid(), kind: "navigate", label: "Open conversation", href: `${routes.app.lead(lead.id)}?tab=conversations`, primary: true },
    ],
  };
}

function nextActions(state: CrmState, now: number): AiReply {
  const overdue = overdueTasks(state, now);
  const stale = staleDeals(state, now);
  const hot = followUpCandidates(state, now);
  const fresh = waitingNewLeads(state, now);
  const items: { title: string; detail: string; tone: "risk" | "action" | "idea" }[] = [];
  if (overdue.length) items.push({ title: `Clear ${overdue.length} overdue ${overdue.length === 1 ? "task" : "tasks"}`, detail: overdue.slice(0, 2).map((t) => t.title).join(" · "), tone: "risk" });
  if (hot.length) items.push({ title: `Follow up with ${hot.length} high-intent leads`, detail: `Starting with ${hot.slice(0, 2).map((l) => l.name).join(" and ")}`, tone: "action" });
  if (stale.length) items.push({ title: `Re-engage ${stale.length} quiet ${stale.length === 1 ? "deal" : "deals"}`, detail: `${formatCurrency(stale.reduce((s, d) => s + d.value, 0))} hasn't moved in 7+ days`, tone: "risk" });
  if (fresh.length) items.push({ title: `Reply to ${fresh.length} new ${fresh.length === 1 ? "lead" : "leads"}`, detail: "Leads contacted within an hour convert 2.4× more often", tone: "action" });
  items.push({ title: "Automate lead assignment", detail: "Route leads scoring 70+ to an owner instantly", tone: "idea" });
  return {
    content: `Here's where your time will have the most impact today, in priority order:`,
    blocks: [{ type: "steps", items: items.slice(0, 5) }],
    actions: [
      { id: aid(), kind: "prompt", label: "Show follow-ups", prompt: "Which leads should I follow up with today?", primary: true },
      { id: aid(), kind: "prompt", label: "Show pipeline risks", prompt: "Which deals are at risk?" },
    ],
  };
}

function automations(state: CrmState, now: number): AiReply {
  const fresh = waitingNewLeads(state, now).length;
  return {
    content: "Based on how your team works today, these three automations would save the most time:",
    blocks: [
      {
        type: "steps",
        items: [
          { title: "Qualify and route new leads", detail: `Score each new lead with AI, then assign 70+ to an owner and nurture the rest. ${fresh} leads arrived this week.`, tone: "idea" },
          { title: "Nudge quiet deals", detail: "When a deal has no activity for 7 days, draft a check-in email and create a task for the owner.", tone: "idea" },
          { title: "Instant first reply", detail: "Send a personalised reply within 5 minutes of a demo request, then book time on the owner's calendar.", tone: "idea" },
        ],
      },
    ],
    actions: [{ id: aid(), kind: "navigate", label: "Open Automation Builder", href: routes.app.automation("lead-qualification"), primary: true }],
  };
}

function forecast(state: CrmState): AiReply {
  const { open, total, weighted } = openPipeline(state);
  const byStage = new Map<string, Deal[]>();
  open.forEach((d) => byStage.set(d.stage, [...(byStage.get(d.stage) ?? []), d]));
  const biggest = [...open].sort((a, b) => b.value - a.value).slice(0, 2);
  return {
    content: `Your open pipeline is **${formatCurrency(total)}** across ${open.length} deals, with a weighted forecast of **${formatCurrency(Math.round(weighted))}**.\n\nThe two largest opportunities are ${biggest.map((d) => `${d.company} (${formatCurrency(d.value)}, ${stageMeta[d.stage].label})`).join(" and ")} — together they're ${Math.round((biggest.reduce((s, d) => s + d.value, 0) / total) * 100)}% of the pipeline.`,
    blocks: [{ type: "deals", dealIds: biggest.map((d) => d.id) }],
    actions: [{ id: aid(), kind: "navigate", label: "Open pipeline", href: routes.app.pipeline, primary: true }],
  };
}

const suggestions = (): AiAction[] => [
  { id: aid(), kind: "prompt", label: "Which leads should I follow up with today?", prompt: "Which leads should I follow up with today?" },
  { id: aid(), kind: "prompt", label: "Which deals are at risk?", prompt: "Which deals are at risk?" },
  { id: aid(), kind: "prompt", label: "Summarize Acme Corp", prompt: "Summarize Acme Corp" },
];

/** Keyword-matched, simulated replies built from the workspace's demo CRM data. */
export function mockReply(prompt: string, state: CrmState, attachments: Attachment[] = [], now = Date.now()): AiReply {
  const p = prompt.toLowerCase();
  let reply: AiReply;

  if (/(draft|write|email to|check-in email)/.test(p)) reply = draftEmail(state, prompt, now);
  else if (/(follow[ -]?up|high[- ]intent|who should i (call|contact)|leads? .*today)/.test(p)) reply = followUps(state, now);
  else if (/(risk|stale|stuck|slipping|inactive|quiet|at risk)/.test(p)) reply = risks(state, now);
  else if (/(automat|workflow|save time)/.test(p)) reply = automations(state, now);
  else if (/(forecast|revenue|pipeline|weighted|quota)/.test(p)) reply = forecast(state);
  else if (/(summar|tell me about|who is|brief me|overview of)/.test(p)) {
    const lead = findLead(state, prompt);
    reply = lead
      ? summary(state, lead, now)
      : {
          content: "Which customer should I summarize? Here are your most active accounts:",
          actions: state.leads
            .filter((l) => state.deals.some((d) => d.contactId === l.id && isOpenStage(d.stage)))
            .sort((a, b) => b.lastActivityAt - a.lastActivityAt)
            .slice(0, 3)
            .map((l) => ({ id: aid(), kind: "prompt" as const, label: l.company, prompt: `Summarize ${l.company}` })),
        };
  } else if (/(what should i|next|priorit|focus|suggest)/.test(p)) reply = nextActions(state, now);
  else if (findLead(state, prompt)) reply = summary(state, findLead(state, prompt)!, now);
  else if (/^(hi|hey|hello|yo|good (morning|afternoon|evening))\b/.test(p)) {
    reply = {
      content: "Hi! I can look across your leads, pipeline, tasks and conversations. Ask me who to follow up with, which deals are at risk, or to summarize a customer.",
      actions: suggestions(),
    };
  } else {
    reply = {
      content: "I don't have an answer for that yet. In this demo I can help with follow-ups, pipeline risks, customer summaries, next actions and automation ideas. Try one of these:",
      actions: suggestions(),
    };
  }

  if (attachments.length > 0) {
    const list = attachments.map((a) => a.name).join(", ");
    reply = {
      ...reply,
      content: `I received ${list}. Reading file contents isn't available in this demo, so I've answered from your workspace data.\n\n${reply.content}`,
    };
  }
  return reply;
}

export function followUpConfirmation(count: number, now: number): AiReply {
  const due = new Date(now);
  due.setHours(17, 0, 0, 0);
  const when = due.getTime() > now ? "today at 5:00 PM" : "within the hour";
  return {
    content: `Done. I created **${count} follow-up ${count === 1 ? "task" : "tasks"}** due ${when}, each assigned to the lead's owner. You'll find them on each contact's Tasks tab.`,
    actions: [{ id: aid(), kind: "navigate", label: "Review leads", href: `${routes.app.leads}?score=hot&sort=score` }],
  };
}

export function titleFor(prompt: string) {
  const clean = prompt.replace(/\s+/g, " ").trim().replace(/[?.!]+$/, "");
  const t = clean.toLowerCase();
  if (/follow[ -]?up/.test(t)) return "Today's follow-ups";
  if (/(risk|stale|at risk)/.test(t)) return "Pipeline risk review";
  if (/automat/.test(t)) return "Automation ideas";
  if (/(forecast|revenue)/.test(t)) return "Pipeline forecast";
  return clean.length > 42 ? `${clean.slice(0, 40)}…` : clean || "New conversation";
}

export function statusLine(lead: Lead, now: number) {
  return `${statusMeta[lead.status].label} · score ${lead.score} · ${formatRelative(lead.lastActivityAt, now).toLowerCase()}`;
}
