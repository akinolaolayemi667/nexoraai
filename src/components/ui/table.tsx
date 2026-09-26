import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { Checkbox } from "./checkbox";
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

type SortState = { key: string; direction: "asc" | "desc" } | null;

export type TableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  empty?: ReactNode;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  defaultSort?: SortState;
  density?: "compact" | "comfortable";
  className?: string;
};

const alignClass = { left: "text-left", right: "text-right", center: "text-center" };

export function Table<T>({
  columns,
  rows,
  getRowId,
  onRowClick,
  loading = false,
  empty,
  selectable = false,
  selectedIds,
  onSelectionChange,
  defaultSort = null,
  density = "comfortable",
  className,
}: TableProps<T>) {
  const [sort, setSort] = useState<SortState>(defaultSort);
  const selected = selectedIds ?? new Set<string>();

  const sortedRows = useMemo(() => {
    const column = sort && columns.find((c) => c.key === sort.key);
    if (!sort || !column?.sortValue) return rows;
    const getValue = column.sortValue;
    return [...rows].sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      const result = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sort.direction === "asc" ? result : -result;
    });
  }, [rows, columns, sort]);

  const allSelected = rows.length > 0 && rows.every((row) => selected.has(getRowId(row)));
  const someSelected = !allSelected && rows.some((row) => selected.has(getRowId(row)));

  function toggleAll() {
    onSelectionChange?.(allSelected ? new Set() : new Set(rows.map(getRowId)));
  }

  function toggleRow(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange?.(next);
  }

  function toggleSort(key: string) {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: "asc" };
      if (current.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  }

  const cellPadding = density === "compact" ? "px-3 py-2" : "px-4 py-3";
  const colCount = columns.length + (selectable ? 1 : 0);

  return (
    <div className={cn("scrollbar-thin overflow-x-auto", className)}>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-border bg-canvas/70">
            {selectable && (
              <th className="w-10 px-4 py-2.5">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
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
                    "whitespace-nowrap px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted",
                    alignClass[column.align ?? "left"],
                  )}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={cn(
                        "inline-flex items-center gap-1 uppercase transition-colors hover:text-ink",
                        active && "text-ink",
                      )}
                    >
                      {column.header}
                      <SortIcon className={cn("size-3", !active && "text-subtle")} />
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
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="border-b border-border last:border-0">
                {Array.from({ length: colCount }).map((__, j) => (
                  <td key={j} className={cellPadding}>
                    <Skeleton className="h-4 w-full max-w-[160px]" />
                  </td>
                ))}
              </tr>
            ))}

          {!loading && sortedRows.length === 0 && (
            <tr>
              <td colSpan={colCount}>{empty ?? <p className="py-12 text-center text-muted">No results.</p>}</td>
            </tr>
          )}

          {!loading &&
            sortedRows.map((row) => {
              const id = getRowId(row);
              const isSelected = selected.has(id);
              return (
                <tr
                  key={id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-border transition-colors last:border-0",
                    onRowClick && "cursor-pointer",
                    isSelected ? "bg-primary-soft/30" : "hover:bg-canvas/70",
                  )}
                >
                  {selectable && (
                    <td className="w-10 px-4" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleRow(id)}
                        aria-label="Select row"
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
