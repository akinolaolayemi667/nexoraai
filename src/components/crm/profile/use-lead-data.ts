import { useMemo } from "react";
import { isOpenStage } from "@/lib/crm/constants";
import { useCrm } from "@/lib/crm/crm-context";
import { seededThreads, seededTimeline } from "@/lib/crm/seed";
import type { Activity, Thread } from "@/lib/crm/types";

export function useLeadData(leadId: string | undefined) {
  const { state } = useCrm();
  const lead = state.leads.find((l) => l.id === leadId);

  const deals = useMemo(() => state.deals.filter((d) => d.contactId === leadId), [state.deals, leadId]);
  const notes = useMemo(
    () => state.notes.filter((n) => n.leadId === leadId).sort((a, b) => b.createdAt - a.createdAt),
    [state.notes, leadId],
  );
  const tasks = useMemo(() => state.tasks.filter((t) => t.leadId === leadId), [state.tasks, leadId]);

  const seedHistory = useMemo(() => (lead ? seededTimeline(lead) : []), [lead]);
  const timeline = useMemo<Activity[]>(() => {
    const fromNotes: Activity[] = notes.map((n) => ({
      id: `note_${n.id}`,
      leadId: n.leadId,
      type: "note",
      title: "Note added",
      detail: n.body,
      actor: n.author,
      at: n.createdAt,
    }));
    return [...seedHistory, ...state.activities.filter((a) => a.leadId === leadId), ...fromNotes].sort((a, b) => b.at - a.at);
  }, [seedHistory, state.activities, notes, leadId]);

  const threads = useMemo<Thread[]>(
    () =>
      lead
        ? seededThreads(lead).map((thread) => ({
            ...thread,
            messages: [...thread.messages, ...(state.replies[thread.id] ?? [])],
          }))
        : [],
    [lead, state.replies],
  );

  const openDeals = deals.filter((d) => isOpenStage(d.stage));
  const openTasks = tasks.filter((t) => !t.done).sort((a, b) => a.dueAt - b.dueAt);

  return { lead, deals, openDeals, notes, tasks, openTasks, timeline, threads };
}
