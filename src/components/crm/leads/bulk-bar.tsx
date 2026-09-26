import { AnimatePresence, motion } from "framer-motion";
import { CircleDot, Download, Trash2, UserRound, X } from "lucide-react";
import { leadStatuses, owners } from "@/lib/crm/constants";
import type { LeadStatus } from "@/lib/crm/types";
import { Avatar, Button, Dropdown } from "@/components/ui";
import { formatNumber } from "@/lib/format";

export function BulkBar({
  count,
  onClear,
  onStatus,
  onOwner,
  onExport,
  onDelete,
}: {
  count: number;
  onClear: () => void;
  onStatus: (status: LeadStatus) => void;
  onOwner: (ownerId: string) => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          role="toolbar"
          aria-label="Bulk actions"
          initial={{ opacity: 0, y: 16, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 16, x: "-50%" }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-1/2 z-40 flex max-w-[calc(100vw-1.5rem)] items-center gap-1 rounded-xl border border-ink/10 bg-ink p-1.5 pl-3 text-white shadow-xl md:bottom-6"
        >
          <span className="mr-1 whitespace-nowrap text-sm font-medium">
            <span className="font-mono tabular-nums">{formatNumber(count)}</span> selected
          </span>
          <span className="mx-1 h-5 w-px bg-white/15" aria-hidden />

          <Dropdown
            side="top"
            items={[
              { type: "label", label: "Set status" },
              ...leadStatuses.map((status) => ({
                label: status.label,
                icon: <span className={`m-1 block size-2 rounded-full ${status.dot}`} />,
                onSelect: () => onStatus(status.id),
              })),
            ]}
            trigger={(props) => <BarButton {...props} icon={<CircleDot />} label="Status" />}
          />
          <Dropdown
            side="top"
            items={[
              { type: "label", label: "Assign owner" },
              ...owners.map((owner) => ({
                label: owner.name,
                description: owner.title,
                icon: <Avatar name={owner.name} size="xs" />,
                onSelect: () => onOwner(owner.id),
              })),
            ]}
            trigger={(props) => <BarButton {...props} icon={<UserRound />} label="Assign" />}
          />
          <BarButton icon={<Download />} label="Export" onClick={onExport} />
          <BarButton icon={<Trash2 />} label="Delete" onClick={onDelete} danger />

          <span className="mx-1 h-5 w-px bg-white/15" aria-hidden />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClear}
            aria-label="Clear selection"
            className="text-white/70 hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white"
          >
            <X />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BarButton({
  icon,
  label,
  danger,
  open: _open,
  ...props
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  open?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement> & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <button
      type="button"
      {...props}
      aria-label={label}
      className={`inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md px-2 text-sm font-medium outline-none transition-colors duration-150 focus-visible:shadow-focus sm:px-2.5 [&_svg]:size-4 ${
        danger ? "text-red-300 hover:bg-red-500/15 hover:text-red-200" : "text-white/85 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
