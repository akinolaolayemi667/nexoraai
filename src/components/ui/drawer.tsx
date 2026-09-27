import { useId, useMemo, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { fadeIn, motionStates, slideIn } from "@/lib/motion";
import { useOverlay } from "@/hooks/use-overlay";
import { Button } from "./button";

const widths = {
  xs: "max-w-72",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
  xl: "max-w-3xl",
};

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  side?: "left" | "right";
  size?: keyof typeof widths;
};

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = "right",
  size = "md",
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const variants = useMemo(() => slideIn(side === "right" ? "right" : "left", "100%"), [side]);
  useOverlay(open, onClose, panelRef);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-overlay backdrop-blur-[2px]"
            variants={fadeIn}
            {...motionStates}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            variants={variants}
            {...motionStates}
            className={cn(
              "glass-overlay absolute inset-y-0 flex w-full flex-col outline-none",
              side === "right" ? "right-0 border-y-0 border-r-0" : "left-0 border-y-0 border-l-0",
              widths[size],
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-4">
              <div className="min-w-0">
                <h2 id={titleId} className="type-h3">
                  {title}
                </h2>
                {description && <p className="mt-1 text-sm text-muted">{description}</p>}
              </div>
              <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close panel" className="-mr-2 -mt-1">
                <X />
              </Button>
            </div>
            <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-hairline bg-white/50 px-6 py-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
