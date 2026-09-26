import { useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { fadeIn, motionStates, scaleIn } from "@/lib/motion";
import { useOverlay } from "@/hooks/use-overlay";
import { Button } from "./button";

const sizes = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof sizes;
  closeOnBackdrop?: boolean;
  hideClose?: boolean;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  hideClose = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useOverlay(open, onClose, panelRef);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <motion.div
            className="absolute inset-0 bg-overlay"
            variants={fadeIn}
            {...motionStates}
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            variants={scaleIn}
            {...motionStates}
            className={cn(
              "relative flex max-h-[calc(100vh-2rem)] w-full flex-col rounded-xl border border-border bg-white shadow-xl outline-none",
              sizes[size],
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
              <div className="min-w-0">
                <h2 id={titleId} className="type-h3">
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className="mt-1 text-sm text-muted">
                    {description}
                  </p>
                )}
              </div>
              {!hideClose && (
                <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close dialog" className="-mr-2 -mt-1">
                  <X />
                </Button>
              )}
            </div>
            {children && <div className="scrollbar-thin overflow-y-auto px-6 py-5">{children}</div>}
            {footer && (
              <div className="flex items-center justify-end gap-2 rounded-b-xl border-t border-border bg-canvas px-6 py-3">
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

export type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  loading = false,
}: ConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useOverlay(open, loading ? () => {} : onClose, panelRef);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-overlay"
            variants={fadeIn}
            {...motionStates}
            onClick={loading ? undefined : onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            variants={scaleIn}
            {...motionStates}
            className="relative w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-xl outline-none"
          >
            <div className="flex gap-4">
              {tone === "danger" && (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-danger-soft text-danger">
                  <AlertTriangle className="size-4" />
                </span>
              )}
              <div className="min-w-0">
                <h2 id={titleId} className="type-h3">
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className="mt-1.5 text-sm text-muted">
                    {description}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                data-autofocus={tone === "danger" ? true : undefined}
              >
                {cancelLabel}
              </Button>
              <Button
                variant={tone === "danger" ? "danger" : "primary"}
                onClick={onConfirm}
                loading={loading}
                data-autofocus={tone === "danger" ? undefined : true}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
