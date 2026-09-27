import { useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { EmptyState } from "./empty-state";
import { Skeleton } from "./loading-state";

export type Column<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  align?: "left" | "right" | "center";
  width?: string;
  className?: string;
};

export type SortState = { key: string; direction: "asc" | "desc" } | null;

export type TableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  activeRowId?: string;
  loading?: boolean;
  loadingRows?: number;
  error?: ReactNode;
  onRetry?: () => void;
  empty?: ReactNode;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  isRowDisabled?: (row: T) => boolean;
  defaultSort?: SortState;
  /** Controlled sort. When `onSortChange` is set, rows are rendered in the order given. */
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  density?: "compact" | "comfortable";
  stickyHeader?: boolean;
  className?: string;
  /** Accessible name for the table. */
  label?: string;
  /** Names a row for its selection checkbox, e.g. "Select Sarah Kim". */
  rowLabel?: (row: T) => string;
};

const alignClass = { left: "text-left", right: "text-right", center: "text-center" };

export function Table<T>({
  columns,
  rows,
  getRowId,
  onRowClick,
  activeRowId,
  loading = false,
  loadingRows = 5,
  error,
  onRetry,
  empty,
  selectable = false,
  selectedIds,
  onSelectionChange,
  isRowDisabled,
  defaultSort = null,
  sort: sortProp,
  onSortChange,
  density = "comfortable",
  stickyHeader = false,
  className,
  label,
  rowLabel,
}: TableProps<T>) {
  const [internalSort, setInternalSort] = useState<SortState>(defaultSort);
  const controlled = onSortChange !== undefined;
  const sort = controlled ? (sortProp ?? null) : internalSort;
  const selected = selectedIds ?? new Set<string>();

  const sortedRows = useMemo(() => {
    const column = sort && columns.find((c) => c.key === sort.key);
    if (controlled || !sort || !column?.sortValue) return rows;
    const getValue = column.sortValue;
    return [...rows].sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      const result =
        typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.direction === "asc" ? result : -result;
    });
  }, [rows, columns, sort, controlled]);

  const selectableRows = rows.filter((row) => !isRowDisabled?.(row));
  const allSelected = selectableRows.length > 0 && selectableRows.every((row) => selected.has(getRowId(row)));
  const someSelected = !allSelected && selectableRows.some((row) => selected.has(getRowId(row)));

  function toggleAll() {
    const next = new Set(selected);
    for (const row of selectableRows) {
      if (allSelected) next.delete(getRowId(row));
      else next.add(getRowId(row));
    }
    onSelectionChange?.(next);
  }

  function toggleRow(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange?.(next);
  }

  function toggleSort(key: string) {
    const next: SortState =
      sort?.key !== key
        ? { key, direction: "asc" }
        : sort.direction === "asc"
          ? { key, direction: "desc" }
          : controlled
            ? { key, direction: "asc" }
            : null;
    if (controlled) onSortChange(next);
    else setInternalSort(next);
  }

  const cellPadding = density === "compact" ? "px-3 py-2" : "px-4 py-3";
  const colCount = columns.length + (selectable ? 1 : 0);
  const showBody = !loading && !error;

  return (
    <div className={cn("@container scrollbar-thin relative overflow-auto", className)}>
      <table className="w-full border-collapse bg-white/70 text-sm" aria-label={label} aria-busy={loading || undefined}>
        <thead className={cn(stickyHeader && "sticky top-0 z-10")}>
          <tr className="border-b border-border/80 bg-slate-50/95">
            {selectable && (
              <th scope="col" className="w-10 px-4 py-2.5">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                  disabled={loading || selectableRows.length === 0}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((column) => {
              const sortable = Boolean(column.sortValue);
              const active = sort?.key === column.key;
              const SortIcon = !active ? ChevronsUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;
              return (
                <th
                  key={column.key}
                  scope="col"
                  style={{ width: column.width }}
                  aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
                  className={cn(
                    "type-overline whitespace-nowrap py-2.5 text-muted",
                    density === "compact" ? "px-3" : "px-4",
                    alignClass[column.align ?? "left"],
                    column.className,
                  )}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={cn(
                        "-mx-1 inline-flex items-center gap-1 rounded-xs px-1 uppercase outline-none transition-colors hover:text-ink focus-visible:shadow-focus",
                        active && "text-ink",
                      )}
                    >
                      {column.header}
                      <SortIcon className={cn("size-3", !active && "text-subtle")} aria-hidden />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: loadingRows }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="border-b border-border-subtle last:border-0">
                {Array.from({ length: colCount }).map((__, j) => (
                  <td key={j} className={cellPadding}>
                    <Skeleton className={cn("h-4", j === 0 && selectable ? "w-4" : "w-full max-w-40")} />
                  </td>
                ))}
              </tr>
            ))}

          {!loading && error && (
            <tr>
              <td colSpan={colCount}>
                <EmptyState
                  tone="error"
                  icon={<AlertTriangle />}
                  title="Couldn't load data"
                  description={error}
                  action={
                    onRetry && (
                      <Button variant="secondary" size="sm" onClick={onRetry}>
                        Try again
                      </Button>
                    )
                  }
                  size="sm"
                />
              </td>
            </tr>
          )}

          {showBody && sortedRows.length === 0 && (
            <tr>
              <td colSpan={colCount}>{empty ?? <p className="py-12 text-center text-muted">No results.</p>}</td>
            </tr>
          )}

          {showBody &&
            sortedRows.map((row) => {
              const id = getRowId(row);
              const isSelected = selected.has(id);
              const isActive = activeRowId === id;
              const disabled = isRowDisabled?.(row) ?? false;
              const clickable = Boolean(onRowClick) && !disabled;
              return (
                <tr
                  key={id}
                  tabIndex={clickable ? 0 : undefined}
                  aria-disabled={disabled || undefined}
                  data-active={isActive || undefined}
                  onClick={clickable ? () => onRowClick?.(row) : undefined}
                  onKeyDown={
                    clickable
                      ? (event) => {
                          if (event.key === "Enter" && event.target === event.currentTarget) onRowClick?.(row);
                        }
                      : undefined
                  }
                  className={cn(
                    "border-b border-border-subtle outline-none transition-colors duration-100 last:border-0",
                    clickable && "cursor-pointer focus-visible:bg-primary/6 focus-visible:shadow-[inset_2px_0_0_var(--color-primary)]",
                    isActive && "bg-primary/8 shadow-[inset_2px_0_0_var(--color-primary)]",
                    !isActive && isSelected && "bg-primary/6",
                    !isActive && !isSelected && !disabled && "hover:bg-primary/4 active:bg-primary/6",
                    disabled && "opacity-50",
                  )}
                >
                  {selectable && (
                    <td className="w-10 px-4" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        disabled={disabled}
                        onChange={() => toggleRow(id)}
                        aria-label={rowLabel ? `Select ${rowLabel(row)}` : "Select row"}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        cellPadding,
                        "text-ink",
                        alignClass[column.align ?? "left"],
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
