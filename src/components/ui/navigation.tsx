import type { ReactNode } from "react";
import { Link, NavLink } from "react-router";
import { ChevronLeft, ChevronRight, ChevronRight as Separator } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { Button } from "./button";

export type BreadcrumbItem = { label: ReactNode; to?: string };

export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 items-center gap-1 text-sm">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={index} className={cn("flex min-w-0 items-center gap-1", last && "truncate")}>
              {item.to && !last ? (
                <Link
                  to={item.to}
                  className="truncate rounded-xs text-muted outline-none transition-colors hover:text-ink focus-visible:shadow-focus"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn("truncate", last ? "font-medium text-ink" : "text-muted")}
                  aria-current={last ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!last && <Separator className="size-3.5 shrink-0 text-subtle" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function TopNavLink({ to, children, end }: { to: string; children: ReactNode; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "rounded-sm text-sm font-medium outline-none transition-colors duration-150 focus-visible:shadow-focus",
          isActive ? "text-ink" : "text-muted hover:text-ink active:text-ink",
        )
      }
    >
      {children}
    </NavLink>
  );
}

function pageRange(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= pageCount - 2) [pageCount - 3, pageCount - 2, pageCount - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("gap");
    result.push(p);
  });
  return result;
}

export type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  total?: number;
  className?: string;
};

export function Pagination({ page, pageCount, onPageChange, pageSize, total, className }: PaginationProps) {
  const start = pageSize && total !== undefined ? Math.min(total, (page - 1) * pageSize + 1) : undefined;
  const end = pageSize && total !== undefined ? Math.min(total, page * pageSize) : undefined;

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-between gap-3", className)}
    >
      {total !== undefined && start !== undefined && end !== undefined ? (
        <p className="text-sm text-muted">
          <span className="text-metric text-ink">{formatNumber(start)}–{formatNumber(end)}</span> of{" "}
          <span className="text-metric text-ink">{formatNumber(total)}</span>
        </p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Button>
        {pageRange(page, pageCount).map((item, index) =>
          item === "gap" ? (
            <span key={`gap-${index}`} className="w-8 text-center text-sm text-subtle">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "h-8 min-w-8 rounded-md px-2 font-mono text-xs tabular-nums outline-none transition-colors duration-150 focus-visible:shadow-focus",
                item === page
                  ? "border border-border bg-white font-medium text-ink shadow-xs"
                  : "text-muted hover:bg-sunken/70 hover:text-ink active:bg-sunken",
              )}
            >
              {item}
            </button>
          ),
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
        >
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}
