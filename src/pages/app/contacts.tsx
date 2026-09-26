import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search, UserRound, Users, X } from "lucide-react";
import { formatNumber, formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useCrm } from "@/lib/crm/crm-context";
import { leadStatuses, ownerById, owners } from "@/lib/crm/constants";
import type { Lead, LeadStatus } from "@/lib/crm/types";
import { useNow } from "@/hooks/use-now";
import { Avatar, Button, Card, EmptyState, Input, Pagination, Table, type Column, type SortState } from "@/components/ui";
import { OwnerChip, StatusBadge } from "@/components/crm/crm-ui";
import { FilterMenu } from "@/components/crm/filter-menu";
import { matchesSearch } from "@/components/crm/leads/use-lead-filters";

const PAGE_SIZE = 25;

const sorters: Record<string, (l: Lead) => string | number> = {
  name: (l) => l.name,
  company: (l) => l.company,
  owner: (l) => ownerById(l.ownerId).name,
  status: (l) => leadStatuses.findIndex((s) => s.id === l.status),
  lastActivity: (l) => l.lastActivityAt,
};

export default function ContactsPage() {
  const navigate = useNavigate();
  const now = useNow();
  const { state } = useCrm();
  const [q, setQ] = useState("");
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [ownerIds, setOwnerIds] = useState<string[]>([]);
  const [sort, setSort] = useState<SortState>({ key: "name", direction: "asc" });
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const filtered = state.leads.filter(
      (l) =>
        matchesSearch(l, q) &&
        (statuses.length === 0 || statuses.includes(l.status)) &&
        (ownerIds.length === 0 || ownerIds.includes(l.ownerId)),
    );
    if (!sort) return filtered;
    const get = sorters[sort.key];
    return filtered.sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      const r = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.direction === "asc" ? r : -r;
    });
  }, [state.leads, q, statuses, ownerIds, sort]);

  const companies = useMemo(() => new Set(state.leads.map((l) => l.company)).size, [state.leads]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const pageRows = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const filtered = q || statuses.length > 0 || ownerIds.length > 0;

  function reset() {
    setQ("");
    setStatuses([]);
    setOwnerIds([]);
    setPage(1);
  }

  const columns: Column<Lead>[] = [
    {
      key: "name",
      header: "Name",
      sortValue: (l) => l.name,
      cell: (l) => (
        <div className="flex min-w-0 max-w-60 items-center gap-3">
          <Avatar name={l.name} size="md" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{l.name}</p>
            <p className="truncate text-xs text-muted @5xl:hidden">{l.email}</p>
            <p className="hidden truncate text-xs text-muted @5xl:block">{l.title || "—"}</p>
          </div>
        </div>
      ),
    },
    { key: "company", header: "Company", sortValue: (l) => l.company, className: "hidden whitespace-nowrap @2xl:table-cell", cell: (l) => l.company },
    {
      key: "email",
      header: "Email",
      className: "hidden whitespace-nowrap @5xl:table-cell",
      cell: (l) => <span className="block max-w-56 truncate text-muted">{l.email}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      className: "hidden whitespace-nowrap @min-[76rem]:table-cell",
      cell: (l) => <span className="font-mono text-xs tabular-nums text-muted">{l.phone || "—"}</span>,
    },
    { key: "owner", header: "Owner", sortValue: (l) => l.ownerId, className: "hidden whitespace-nowrap @3xl:table-cell", cell: (l) => <OwnerChip ownerId={l.ownerId} /> },
    { key: "status", header: "Status", sortValue: (l) => l.status, cell: (l) => <StatusBadge status={l.status} /> },
    {
      key: "lastActivity",
      header: "Last activity",
      sortValue: (l) => l.lastActivityAt,
      className: "hidden whitespace-nowrap @4xl:table-cell",
      cell: (l) => <span className="font-mono text-xs tabular-nums text-muted">{formatRelative(l.lastActivityAt, now)}</span>,
    },
  ];

  const empty = (
    <EmptyState
      icon={<Users />}
      title={filtered ? "No contacts match" : "No contacts yet"}
      description={filtered ? "Try a different search or clear your filters." : "Contacts appear here as leads are added."}
      action={
        filtered && (
          <Button variant="secondary" size="sm" onClick={reset}>
            Clear filters
          </Button>
        )
      }
    />
  );

  return (
    <>
      <title>Contacts · NEXORA AI</title>

      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Contacts</h1>
        <p className="mt-1 text-base text-muted">
          <span className="font-mono tabular-nums text-ink">{formatNumber(state.leads.length)}</span> people across{" "}
          <span className="font-mono tabular-nums text-ink">{formatNumber(companies)}</span> companies
        </p>
      </header>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:px-5">
          <Input
            size="sm"
            type="search"
            aria-label="Search contacts"
            placeholder="Search name, company or email"
            leftIcon={<Search />}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            rightSlot={
              q ? (
                <button type="button" onClick={() => setQ("")} className="rounded-xs text-subtle hover:text-ink" aria-label="Clear search">
                  <X className="size-3.5" />
                </button>
              ) : undefined
            }
            containerClassName="w-full sm:w-80"
            className="[&::-webkit-search-cancel-button]:hidden"
          />
          <div className="flex items-center gap-2">
            <FilterMenu
              label="Status"
              options={leadStatuses.map((s) => ({ value: s.id, label: s.label }))}
              selected={statuses}
              onChange={(next) => {
                setStatuses(next);
                setPage(1);
              }}
            />
            <FilterMenu
              label="Owner"
              icon={<UserRound />}
              options={owners.map((o) => ({ value: o.id, label: o.name }))}
              selected={ownerIds}
              onChange={(next) => {
                setOwnerIds(next);
                setPage(1);
              }}
            />
          </div>
          <p className="text-sm text-muted sm:ml-auto">
            <span className="font-mono tabular-nums text-ink">{formatNumber(rows.length)}</span> contacts
          </p>
        </div>

        <div className="hidden md:block">
          <Table
            label="Contacts"
            rowLabel={(l) => l.name}
            columns={columns}
            rows={pageRows}
            getRowId={(l) => l.id}
            onRowClick={(l) => navigate(routes.app.contact(l.id))}
            sort={sort}
            onSortChange={(next) => {
              setSort(next);
              setPage(1);
            }}
            empty={empty}
          />
        </div>

        <ul className="divide-y divide-border-subtle md:hidden">
          {pageRows.length === 0 && <li>{empty}</li>}
          {pageRows.map((l) => (
            <li key={l.id}>
              <Link to={routes.app.contact(l.id)} className="flex items-center gap-3 px-4 py-3 outline-none active:bg-canvas focus-visible:bg-canvas">
                <Avatar name={l.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{l.name}</p>
                  <p className="truncate text-xs text-muted">
                    {l.company} · {l.email}
                  </p>
                </div>
                <StatusBadge status={l.status} />
              </Link>
            </li>
          ))}
        </ul>

        {rows.length > PAGE_SIZE && (
          <div className="border-t border-border px-4 py-3 sm:px-5">
            <Pagination
              page={current}
              pageCount={pageCount}
              pageSize={PAGE_SIZE}
              total={rows.length}
              onPageChange={(next) => {
                setPage(next);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        )}
      </Card>
    </>
  );
}
