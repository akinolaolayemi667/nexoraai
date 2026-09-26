import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useUser } from "@/lib/auth/auth-context";
import { useCrm } from "@/lib/crm/crm-context";
import type { RunRecord, WorkflowDoc, WorkflowStats } from "./types";
import { docReducer, seedStats, templateDoc, type DocAction } from "./workflow";

const storageKey = (userId: string) => `nexora:automation:v1:${userId}`;

type Stored = { saved: WorkflowDoc; savedAt: number | null; stats: WorkflowStats };

function load(userId: string, leadNames: string[]): Stored {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw) as Stored;
      if (parsed.saved && Array.isArray(parsed.saved.nodes) && parsed.stats) return parsed;
    }
  } catch {
    // Unreadable storage falls back to the starter workflow.
  }
  return { saved: templateDoc(), savedAt: null, stats: seedStats(leadNames) };
}

export function useWorkflow() {
  const user = useUser();
  const { state } = useCrm();
  const [initial] = useState(() => load(user.id, state.leads.slice(0, 8).map((l) => l.name)));
  const [saved, setSaved] = useState(initial.saved);
  const [savedAt, setSavedAt] = useState(initial.savedAt);
  const [stats, setStats] = useState(initial.stats);
  const [doc, dispatch] = useReducer(docReducer, initial.saved);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(user.id), JSON.stringify({ saved, savedAt, stats } satisfies Stored));
    } catch {
      // Storage unavailable: changes last for this session only.
    }
  }, [saved, savedAt, stats, user.id]);

  const dirty = useMemo(() => JSON.stringify(doc) !== JSON.stringify(saved), [doc, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = useCallback(() => {
    setSaved(doc);
    setSavedAt(Date.now());
  }, [doc]);

  const discard = useCallback(() => dispatch({ type: "replace", doc: saved }), [saved]);

  const recordRun = useCallback((run: RunRecord) => {
    setStats((s) => ({
      runs: s.runs + 1,
      successes: s.successes + (run.ok ? 1 : 0),
      lastRunAt: run.at,
      history: [run, ...s.history].slice(0, 8),
    }));
  }, []);

  return { doc, dispatch: dispatch as (action: DocAction) => void, dirty, save, discard, savedAt, stats, recordRun };
}
