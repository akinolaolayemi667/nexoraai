import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { leadStatuses, ownerById, scoreTier, sourceLabel } from "@/lib/crm/constants";
import type { Lead, LeadSource, LeadStatus, ScoreTier } from "@/lib/crm/types";

export type LeadSortKey = "name" | "company" | "source" | "status" | "score" | "owner" | "lastActivity";
export type LeadSort = { key: LeadSortKey; direction: "asc" | "desc" };

export type LeadFilters = {
  q: string;
  status: LeadStatus | "all";
  sources: LeadSource[];
  owners: string[];
  tiers: ScoreTier[];
  sort: LeadSort;
  page: number;
  size: number;
};

export const pageSizes = [10, 25, 50];
const sortKeys: LeadSortKey[] = ["name", "company", "source", "status", "score", "owner", "lastActivity"];
const defaultSort: LeadSort = { key: "lastActivity", direction: "desc" };

const list = <T extends string>(value: string | null) => (value ? (value.split(",").filter(Boolean) as T[]) : []);

export function useLeadFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<LeadFilters>(() => {
    const status = params.get("status") as LeadStatus | null;
    const sortKey = params.get("sort") as LeadSortKey | null;
    const size = Number(params.get("size"));
    return {
      q: params.get("q") ?? "",
      status: status && leadStatuses.some((s) => s.id === status) ? status : "all",
      sources: list<LeadSource>(params.get("source")),
      owners: list<string>(params.get("owner")),
      tiers: list<ScoreTier>(params.get("score")),
      sort:
        sortKey && sortKeys.includes(sortKey)
          ? { key: sortKey, direction: params.get("dir") === "asc" ? "asc" : "desc" }
          : defaultSort,
      page: Math.max(1, Number(params.get("page")) || 1),
      size: pageSizes.includes(size) ? size : 10,
    };
  }, [params]);

  const update = useCallback(
    (patch: Partial<LeadFilters>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          const set = (key: string, value: string | null) => (value ? next.set(key, value) : next.delete(key));
          if ("q" in patch) set("q", patch.q?.trim() ? patch.q : null);
          if ("status" in patch) set("status", patch.status === "all" ? null : (patch.status ?? null));
          if ("sources" in patch) set("source", patch.sources?.join(",") || null);
          if ("owners" in patch) set("owner", patch.owners?.join(",") || null);
          if ("tiers" in patch) set("score", patch.tiers?.join(",") || null);
          if (patch.sort) {
            const isDefault = patch.sort.key === defaultSort.key && patch.sort.direction === defaultSort.direction;
            set("sort", isDefault ? null : patch.sort.key);
            set("dir", isDefault ? null : patch.sort.direction);
          }
          if (patch.size) set("size", patch.size === 10 ? null : String(patch.size));
          // Any change other than paging sends you back to the first page.
          set("page", patch.page && patch.page > 1 ? String(patch.page) : null);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const clear = useCallback(() => update({ q: "", sources: [], owners: [], tiers: [] }), [update]);
  const activeCount = filters.sources.length + filters.owners.length + filters.tiers.length + (filters.q ? 1 : 0);

  return { filters, update, clear, activeCount };
}

const statusRank = Object.fromEntries(leadStatuses.map((s, i) => [s.id, i])) as Record<LeadStatus, number>;

const sortValue: Record<LeadSortKey, (lead: Lead) => string | number> = {
  name: (l) => l.name,
  company: (l) => l.company,
  source: (l) => sourceLabel[l.source],
  status: (l) => statusRank[l.status],
  score: (l) => l.score,
  owner: (l) => ownerById(l.ownerId).name,
  lastActivity: (l) => l.lastActivityAt,
};

export function matchesSearch(lead: Lead, q: string) {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  return [lead.name, lead.company, lead.email, lead.title].some((field) => field.toLowerCase().includes(needle));
}

/** Everything except the status tab, so tab counts reflect the other filters. */
export function applyFilters(leads: Lead[], f: LeadFilters) {
  return leads.filter(
    (lead) =>
      matchesSearch(lead, f.q) &&
      (f.sources.length === 0 || f.sources.includes(lead.source)) &&
      (f.owners.length === 0 || f.owners.includes(lead.ownerId)) &&
      (f.tiers.length === 0 || f.tiers.includes(scoreTier(lead.score))),
  );
}

export function sortLeads(leads: Lead[], sort: LeadSort) {
  const get = sortValue[sort.key];
  return [...leads].sort((a, b) => {
    const av = get(a);
    const bv = get(b);
    const result = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
    return (sort.direction === "asc" ? result : -result) || b.lastActivityAt - a.lastActivityAt;
  });
}
