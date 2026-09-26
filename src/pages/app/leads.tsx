import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowDownUp,
  Copy,
  Download,
  ExternalLink,
  Filter,
  Gauge,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { downloadCsv } from "@/lib/csv";
import { formatNumber, formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useUser } from "@/lib/auth/auth-context";
import { useCrm } from "@/lib/crm/crm-context";
import {
  leadSources,
  leadStatuses,
  ownerById,
  ownerFirstName,
  ownerIdFor,
  owners,
  scoreTiers,
  sourceLabel,
  statusMeta,
} from "@/lib/crm/constants";
import type { Lead, LeadStatus } from "@/lib/crm/types";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useNow } from "@/hooks/use-now";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  ConfirmDialog,
  Dropdown,
  EmptyState,
  Input,
  Pagination,
  Table,
  Tabs,
  useToast,
  type Column,
  type SortState,
} from "@/components/ui";
import { OwnerChip, ScorePill, StatusBadge } from "@/components/crm/crm-ui";
import { FilterMenu } from "@/components/crm/filter-menu";
import { AddLeadModal } from "@/components/crm/leads/add-lead-modal";
import { BulkBar } from "@/components/crm/leads/bulk-bar";
import {
  applyFilters,
  pageSizes,
  sortLeads,
  useLeadFilters,
  type LeadSort,
  type LeadSortKey,
} from "@/components/crm/leads/use-lead-filters";

const mobileSorts: { label: string; sort: LeadSort }[] = [
  { label: "Recent activity", sort: { key: "lastActivity", direction: "desc" } },
  { label: "Highest score", sort: { key: "score", direction: "desc" } },
  { label: "Lowest score", sort: { key: "score", direction: "asc" } },
  { label: "Name A–Z", sort: { key: "name", direction: "asc" } },
  { label: "Company A–Z", sort: { key: "company", direction: "asc" } },
];

function exportLeads(leads: Lead[], filename: string) {
  downloadCsv(filename, [
    ["Name", "Title", "Company", "Email", "Phone", "Source", "Status", "Score", "Owner", "Last activity", "Last activity at"],
    ...leads.map((l) => [
      l.name,
      l.title,
      l.company,
      l.email,
      l.phone,
      sourceLabel[l.source],
      statusMeta[l.status].label,
      l.score,
      ownerById(l.ownerId).name,
      l.lastActivity,
      new Date(l.lastActivityAt).toISOString(),
    ]),
  ]);
}

export default function LeadsPage() {
  const navigate = useNavigate();
  const user = useUser();
  const now = useNow();
  const { toast } = useToast();
  const { state, actions } = useCrm();
  const { filters, update, clear, activeCount } = useLeadFilters();
  const [search, setSearch] = useState(filters.q);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const addLead = useDisclosure();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (search === filters.q) return;
    const timer = window.setTimeout(() => update({ q: search }), 150);
    return () => window.clearTimeout(timer);
  }, [search, filters.q, update]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (event.key !== "/" || target.closest("input, textarea, select, [contenteditable]")) return;
      event.preventDefault();
      searchRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filterKey = [filters.q, filters.status, filters.sources, filters.owners, filters.tiers].join("|");
  useEffect(() => setSelected(new Set()), [filterKey]);

  const base = useMemo(() => applyFilters(state.leads, filters), [state.leads, filters]);
  const counts = useMemo(() => {
    const result = Object.fromEntries(leadStatuses.map((s) => [s.id, 0])) as Record<LeadStatus, number>;
    base.forEach((lead) => (result[lead.status] += 1));
    return result;
  }, [base]);
  const rows = useMemo(
    () => sortLeads(filters.status === "all" ? base : base.filter((l) => l.status === filters.status), filters.sort),
    [base, filters.status, filters.sort],
  );

  const pageCount = Math.max(1, Math.ceil(rows.length / filters.size));
  const page = Math.min(filters.page, pageCount);
  const pageRows = rows.slice((page - 1) * filters.size, page * filters.size);
  const pageAllSelected = pageRows.length > 0 && pageRows.every((l) => selected.has(l.id));
  const pageSomeSelected = !pageAllSelected && pageRows.some((l) => selected.has(l.id));
  const allMatchingSelected = rows.length > 0 && selected.size === rows.length;
  const weekAgo = now - 7 * 24 * 3600_000;
  const newThisWeek = state.leads.filter((l) => l.createdAt >= weekAgo).length;
  const hasFilters = activeCount > 0 || filters.status !== "all";

  function clearAll() {
    setSearch("");
    clear();
  }

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function togglePage() {
    setSelected((current) => {
      const next = new Set(current);
      pageRows.forEach((l) => (pageAllSelected ? next.delete(l.id) : next.add(l.id)));
      return next;
    });
  }

  function setStatus(ids: string[], status: LeadStatus) {
    actions.updateLeads(ids, { status });
    setSelected(new Set());
    toast({
      variant: "success",
      title: ids.length === 1 ? `Moved to ${statusMeta[status].label}` : `${formatNumber(ids.length)} leads moved to ${statusMeta[status].label}`,
    });
  }

  function setOwner(ids: string[], ownerId: string) {
    actions.updateLeads(ids, { ownerId });
    setSelected(new Set());
    toast({
      variant: "success",
      title: `${ids.length === 1 ? "Lead" : `${formatNumber(ids.length)} leads`} assigned to ${ownerById(ownerId).name}`,
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    actions.deleteLeads(pendingDelete);
    toast({ title: pendingDelete.length === 1 ? "Lead deleted" : `${formatNumber(pendingDelete.length)} leads deleted` });
    setSelected(new Set());
    setPendingDelete(null);
  }

  function onSortChange(next: SortState) {
    if (next) update({ sort: { key: next.key as LeadSortKey, direction: next.direction } });
  }

  const rowMenu = (lead: Lead) => (
    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} className="flex justify-end">
      <Dropdown
        align="end"
        width="w-52"
        items={[
          { label: "Open profile", icon: <ExternalLink />, onSelect: () => navigate(routes.app.lead(lead.id)) },
          {
            label: "Copy email",
            icon: <Copy />,
            onSelect: () => {
              void navigator.clipboard?.writeText(lead.email);
              toast({ title: "Email copied", description: lead.email });
            },
          },
          { type: "separator" },
          { type: "label", label: "Set status" },
          ...leadStatuses.map((s) => ({
            label: s.label,
            icon: <span className={cn("m-1 block size-2 rounded-full", s.dot)} />,
            disabled: s.id === lead.status,
            onSelect: () => setStatus([lead.id], s.id),
          })),
          { type: "separator" },
          { label: "Delete lead", icon: <Trash2 />, danger: true, onSelect: () => setPendingDelete([lead.id]) },
        ]}
        trigger={({ open, ...props }) => (
          <Button
            {...props}
            variant="ghost"
            size="icon-xs"
            aria-label={`Actions for ${lead.name}`}
            className={cn("text-subtle", open && "bg-sunken text-ink")}
          >
            <MoreHorizontal />
          </Button>
        )}
      />
    </div>
  );

  const columns: Column<Lead>[] = [
    {
      key: "name",
      header: "Name",
      sortValue: (l) => l.name,
      cell: (l) => (
        <div className="flex min-w-0 max-w-56 items-center gap-3">
          <Avatar name={l.name} size="md" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{l.name}</p>
            <p className="truncate text-xs text-muted @2xl:hidden">{l.company}</p>
            <p className="hidden truncate text-xs text-muted @2xl:block">{l.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      sortValue: (l) => l.company,
      className: "hidden whitespace-nowrap @2xl:table-cell",
      cell: (l) => (
        <div className="min-w-0 max-w-44">
          <p className="truncate text-ink">{l.company}</p>
          <p className="truncate text-xs text-muted">{l.title}</p>
        </div>
      ),
    },
    { key: "source", header: "Source", sortValue: (l) => l.source, className: "hidden whitespace-nowrap text-muted @5xl:table-cell", cell: (l) => sourceLabel[l.source] },
    { key: "status", header: "Status", sortValue: (l) => l.status, cell: (l) => <StatusBadge status={l.status} /> },
    { key: "score", header: "Score", sortValue: (l) => l.score, cell: (l) => <ScorePill score={l.score} /> },
    { key: "owner", header: "Owner", sortValue: (l) => l.ownerId, className: "hidden whitespace-nowrap @4xl:table-cell", cell: (l) => <OwnerChip ownerId={l.ownerId} /> },
    {
      key: "lastActivity",
      header: "Last activity",
      sortValue: (l) => l.lastActivityAt,
      className: "hidden whitespace-nowrap @min-[66rem]:table-cell",
      cell: (l) => (
        <div className="min-w-0 max-w-36">
          <p className="font-mono text-xs tabular-nums text-ink" title={new Date(l.lastActivityAt).toLocaleString()}>
            {formatRelative(l.lastActivityAt, now)}
          </p>
          <p className="truncate text-xs text-muted">{l.lastActivity}</p>
        </div>
      ),
    },
    { key: "actions", header: <span className="sr-only">Actions</span>, width: "3rem", cell: rowMenu },
  ];

  const emptyState = hasFilters ? (
    <EmptyState
      icon={<Filter />}
      title="No leads match these filters"
      description="Try a different search or remove a filter to see more leads."
      action={
        <Button variant="secondary" size="sm" onClick={() => { clearAll(); update({ status: "all" }); }}>
          Clear all filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={<Users />}
      title="No leads yet"
      description="Add your first lead or connect a form to start capturing them automatically."
      action={<Button size="sm" leftIcon={<Plus />} onClick={addLead.open}>Add lead</Button>}
    />
  );

  return (
    <>
      <title>Leads · NEXORA AI</title>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Leads</h1>
          <p className="mt-1 text-base text-muted">
            <span className="font-mono tabular-nums text-ink">{formatNumber(state.leads.length)}</span> leads
            {newThisWeek > 0 && (
              <>
                {" "}· <span className="font-mono tabular-nums text-ink">{newThisWeek}</span> added this week
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download />}
            className="flex-1 sm:flex-none"
            disabled={rows.length === 0}
            onClick={() => {
              exportLeads(rows, "nexora-leads.csv");
              toast({ variant: "success", title: `Exported ${formatNumber(rows.length)} leads`, description: "nexora-leads.csv is in your downloads." });
            }}
          >
            Export
          </Button>
          <Button size="sm" leftIcon={<Plus />} className="flex-1 sm:flex-none" onClick={addLead.open}>
            Add lead
          </Button>
        </div>
      </header>

      <Card className="mt-6 overflow-hidden">
        <div className="scrollbar-none overflow-x-auto px-4 sm:px-5">
          <Tabs
            value={filters.status}
            onValueChange={(value) => update({ status: value as LeadStatus | "all" })}
            className="min-w-max"
            items={[
              { value: "all", label: "All", count: base.length },
              ...leadStatuses.map((s) => ({ value: s.id, label: s.label, count: counts[s.id] })),
            ]}
          />
        </div>

        <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:px-5 lg:flex-row lg:items-center">
          <Input
            ref={searchRef}
            size="sm"
            type="search"
            aria-label="Search leads"
            placeholder="Search name, company or email"
            leftIcon={<Search />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && search) {
                e.stopPropagation();
                setSearch("");
              }
            }}
            rightSlot={
              search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="pointer-events-auto rounded-xs text-subtle outline-none hover:text-ink focus-visible:shadow-focus"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              ) : (
                <kbd className="hidden rounded-xs border border-border bg-canvas px-1.5 font-mono text-2xs text-subtle sm:inline">/</kbd>
              )
            }
            containerClassName="w-full lg:w-80"
            className="[&::-webkit-search-cancel-button]:hidden"
          />
          <div className="scrollbar-none -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <FilterMenu
              label="Source"
              options={leadSources.map((s) => ({ value: s.id, label: s.label }))}
              selected={filters.sources}
              onChange={(sources) => update({ sources })}
            />
            <FilterMenu
              label="Owner"
              icon={<UserRound />}
              options={owners.map((o) => ({ value: o.id, label: o.name }))}
              selected={filters.owners}
              onChange={(ids) => update({ owners: ids })}
            />
            <FilterMenu
              label="Score"
              icon={<Gauge />}
              options={scoreTiers.map((t) => ({ value: t.id, label: t.label, description: t.range }))}
              selected={filters.tiers}
              onChange={(tiers) => update({ tiers })}
            />
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="shrink-0">
                Clear
              </Button>
            )}
            <div className="ml-auto md:hidden">
              <Dropdown
                align="end"
                width="w-48"
                items={mobileSorts.map((option) => ({
                  label: option.label,
                  selected: option.sort.key === filters.sort.key && option.sort.direction === filters.sort.direction,
                  onSelect: () => update({ sort: option.sort }),
                }))}
                trigger={({ open, ...props }) => (
                  <Button {...props} variant="secondary" size="sm" leftIcon={<ArrowDownUp />} className={cn(open && "bg-canvas")}>
                    Sort
                  </Button>
                )}
              />
            </div>
          </div>
          <p className="hidden shrink-0 text-sm text-muted lg:ml-auto lg:block">
            <span className="font-mono tabular-nums text-ink">{formatNumber(rows.length)}</span>{" "}
            {rows.length === 1 ? "result" : "results"}
          </p>
        </div>

        {pageAllSelected && rows.length > pageRows.length && (
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-b border-primary-border bg-primary-soft/30 px-4 py-2 text-center text-sm text-ink">
            {allMatchingSelected ? (
              <>
                All <span className="font-mono tabular-nums">{formatNumber(rows.length)}</span> matching leads are selected.
                <Button variant="link" onClick={() => setSelected(new Set())}>
                  Clear selection
                </Button>
              </>
            ) : (
              <>
                All <span className="font-mono tabular-nums">{pageRows.length}</span> leads on this page are selected.
                <Button variant="link" onClick={() => setSelected(new Set(rows.map((l) => l.id)))}>
                  Select all {formatNumber(rows.length)} matching leads
                </Button>
              </>
            )}
          </div>
        )}

        <div className="hidden md:block">
          <Table
            columns={columns}
            rows={pageRows}
            getRowId={(l) => l.id}
            onRowClick={(l) => navigate(routes.app.lead(l.id))}
            selectable
            selectedIds={selected}
            onSelectionChange={setSelected}
            sort={filters.sort}
            onSortChange={onSortChange}
            density="compact"
            empty={emptyState}
          />
        </div>

        <div className="md:hidden">
          {pageRows.length === 0 ? (
            emptyState
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-border-subtle bg-canvas px-4 py-2">
                <Checkbox
                  checked={pageAllSelected}
                  indeterminate={pageSomeSelected}
                  onChange={togglePage}
                  aria-label="Select all leads on this page"
                />
                <span className="type-overline">
                  {mobileSorts.find((o) => o.sort.key === filters.sort.key && o.sort.direction === filters.sort.direction)?.label ?? "Sorted"}
                </span>
                <span className="ml-auto font-mono text-xs tabular-nums text-muted">{formatNumber(rows.length)} results</span>
              </div>
              <ul className="divide-y divide-border-subtle">
                {pageRows.map((lead) => (
                  <li
                    key={lead.id}
                    className={cn("flex items-start gap-3 px-4 py-3", selected.has(lead.id) && "bg-primary-soft/25")}
                  >
                    <Checkbox
                      className="mt-2"
                      checked={selected.has(lead.id)}
                      onChange={() => toggle(lead.id)}
                      aria-label={`Select ${lead.name}`}
                    />
                    <Link
                      to={routes.app.lead(lead.id)}
                      className="flex min-w-0 flex-1 items-start gap-3 rounded-md outline-none focus-visible:shadow-focus"
                    >
                      <Avatar name={lead.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-medium text-ink">{lead.name}</p>
                          <ScorePill score={lead.score} className="shrink-0" />
                        </div>
                        <p className="truncate text-xs text-muted">
                          {lead.company} · {sourceLabel[lead.source]}
                        </p>
                        <div className="mt-1.5 flex min-w-0 items-center gap-2 text-xs text-muted">
                          <StatusBadge status={lead.status} />
                          <span className="truncate">{ownerFirstName(lead.ownerId)}</span>
                          <span aria-hidden>·</span>
                          <span className="shrink-0 font-mono tabular-nums">{formatRelative(lead.lastActivityAt, now)}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {rows.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:px-5">
            <label className="flex items-center gap-2 text-sm text-muted">
              Rows
              <select
                value={filters.size}
                onChange={(e) => update({ size: Number(e.target.value) })}
                className="h-8 cursor-pointer rounded-md border border-border bg-white px-2 font-mono text-xs tabular-nums text-ink outline-none focus-visible:border-primary focus-visible:shadow-focus"
              >
                {pageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <Pagination
              className="flex-1"
              page={page}
              pageCount={pageCount}
              pageSize={filters.size}
              total={rows.length}
              onPageChange={(next) => {
                update({ page: next });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        )}
      </Card>

      <BulkBar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        onStatus={(status) => setStatus([...selected], status)}
        onOwner={(ownerId) => setOwner([...selected], ownerId)}
        onExport={() => {
          const chosen = state.leads.filter((l) => selected.has(l.id));
          exportLeads(chosen, "nexora-leads-selected.csv");
          toast({ variant: "success", title: `Exported ${formatNumber(chosen.length)} leads` });
        }}
        onDelete={() => setPendingDelete([...selected])}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        tone="danger"
        title={pendingDelete?.length === 1 ? "Delete this lead?" : `Delete ${formatNumber(pendingDelete?.length ?? 0)} leads?`}
        description="Their notes, tasks and activity will be removed too. Deals stay in the pipeline without a contact."
        confirmLabel="Delete"
      />

      <AddLeadModal
        open={addLead.isOpen}
        onClose={addLead.close}
        defaultOwnerId={ownerIdFor(user.name)}
        onCreated={(lead) => {
          setSearch("");
          update({ status: "all", q: "", sources: [], owners: [], tiers: [], sort: { key: "lastActivity", direction: "desc" } });
          toast({
            variant: "success",
            title: `${lead.name} added`,
            description: `Scored ${lead.score} · assigned to ${ownerById(lead.ownerId).name}`,
            action: { label: "View", onClick: () => navigate(routes.app.lead(lead.id)) },
          });
        }}
      />
    </>
  );
}
