import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useUser } from "@/lib/auth/auth-context";
import { useCrm } from "@/lib/crm/crm-context";
import type { WorkflowInfo } from "./catalog";
import { defaultStored, readStored, writeStored } from "./storage";
import type { RunRecord } from "./types";
import { docReducer, type DocAction } from "./workflow";

export function useWorkflow(workflow: WorkflowInfo) {
  const user = useUser();
  const { state } = useCrm();
  const [initial] = useState(() => readStored(user.id, workflow.id) ?? defaultStored(workflow, state.leads));
  const [saved, setSaved] = useState(initial.saved);
  const [savedAt, setSavedAt] = useState(initial.savedAt);
  const [stats, setStats] = useState(initial.stats);
  const [doc, dispatch] = useReducer(docReducer, initial.saved);

  useEffect(() => {
    writeStored(user.id, workflow.id, { saved, savedAt, stats });
  }, [saved, savedAt, stats, user.id, workflow.id]);

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

  const recordRun = useCallback((run: RunRecord) => {
    setStats((s) => ({
      runs: s.runs + 1,
      successes: s.successes + (run.ok ? 1 : 0),
      lastRunAt: run.at,
      history: [run, ...s.history].slice(0, 8),
    }));
  }, []);

  return { doc, dispatch: dispatch as (action: DocAction) => void, dirty, save, savedAt, stats, recordRun };
}
