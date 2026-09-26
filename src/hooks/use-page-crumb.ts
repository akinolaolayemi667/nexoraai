import { useEffect, useSyncExternalStore } from "react";

let label: string | null = null;
const listeners = new Set<() => void>();

function setLabel(next: string | null) {
  label = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Label for the last breadcrumb on detail routes, e.g. a contact's name. */
export function usePageCrumb() {
  return useSyncExternalStore(subscribe, () => label);
}

export function useSetPageCrumb(value: string | undefined) {
  useEffect(() => {
    setLabel(value ?? null);
    return () => setLabel(null);
  }, [value]);
}
