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
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-overlay backdrop-blur-[2px]"
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
              "glass-overlay relative flex max-h-[calc(100dvh-2.5rem)] w-full flex-col rounded-t-3xl border-b-0 outline-none sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl sm:border-b",
              sizes[size],
            )}
          >
            <span className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border-strong sm:hidden" aria-hidden />
            <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 pb-4 pt-2 sm:pt-5">
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
              <div className="flex flex-col-reverse gap-2 border-t border-hairline bg-white/50 px-6 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-end sm:rounded-b-2xl sm:pb-3">
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
            className="absolute inset-0 bg-overlay backdrop-blur-[2px]"
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
            className="glass-overlay relative w-full max-w-md rounded-2xl p-6 outline-none"
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
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
