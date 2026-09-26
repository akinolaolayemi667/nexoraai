import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { Dropdown, type DropdownItem } from "@/components/ui";

export type FilterOption<T extends string> = { value: T; label: ReactNode; description?: ReactNode };

export function FilterMenu<T extends string>({
  label,
  icon,
  options,
  selected,
  onChange,
  align = "start",
}: {
  label: string;
  icon?: ReactNode;
  options: FilterOption<T>[];
  selected: T[];
  onChange: (next: T[]) => void;
  align?: "start" | "end";
}) {
  const items: DropdownItem[] = [
    { type: "label", label: `Filter by ${label.toLowerCase()}` },
    ...options.map((option) => ({
      label: option.label,
      description: option.description,
      selected: selected.includes(option.value),
      keepOpen: true,
      onSelect: () =>
        onChange(
          selected.includes(option.value) ? selected.filter((v) => v !== option.value) : [...selected, option.value],
        ),
    })),
    ...(selected.length > 0
      ? ([{ type: "separator" }, { label: "Clear selection", onSelect: () => onChange([]) }] as DropdownItem[])
      : []),
  ];

  return (
    <Dropdown
      align={align}
      width="w-56"
      items={items}
      trigger={({ open, ...props }) => (
        <button
          type="button"
          {...props}
          className={cn(
            "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-sm font-medium outline-none transition-[border-color,background-color,box-shadow] duration-150 focus-visible:border-primary focus-visible:shadow-focus [&_svg]:size-3.5",
            selected.length > 0
              ? "border-primary-border bg-primary-soft/40 text-primary-active hover:bg-primary-soft/60"
              : "border-border bg-white text-ink shadow-xs hover:border-border-strong hover:bg-canvas",
            open && "border-border-strong bg-canvas",
          )}
        >
          {icon}
          {label}
          {selected.length > 0 && (
            <span className="rounded-xs bg-primary px-1 font-mono text-2xs tabular-nums text-white">{selected.length}</span>
          )}
          <ChevronDown className={cn("text-subtle transition-transform duration-150", open && "rotate-180")} aria-hidden />
        </button>
      )}
    />
  );
}
