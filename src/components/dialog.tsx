"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: "modal" | "drawer";
  closeLabel?: string;
};

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  variant = "modal",
  closeLabel = "Tutup dialog",
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const isDrawer = variant === "drawer";

  useEffect(() => {
    const dialog = ref.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;

    if (!dialog) {
      return;
    }

    function handleClose() {
      if (open) {
        onClose();
      }
    }

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className={isDrawer ? "drawer-dialog text-surface" : "dialog-panel"}
    >
      <div className={isDrawer ? "flex min-h-dvh flex-col" : undefined}>
        <div
          className={
            isDrawer
              ? "flex items-start justify-between gap-4 px-5 pb-4 pt-5"
              : "sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface px-5 py-4"
          }
        >
          <h2
            id={titleId}
            className={
              isDrawer
                ? "font-heading text-lg font-semibold text-surface"
                : "font-heading text-lg font-semibold text-ink"
            }
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className={
              isDrawer
                ? "inline-flex h-11 min-w-11 items-center justify-center rounded-lg text-sidebar-muted transition-colors hover:bg-sidebar-soft hover:text-surface"
                : "inline-flex h-11 min-w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-soft hover:text-ink"
            }
          >
            <CloseIcon />
          </button>
        </div>
        <div className={isDrawer ? "flex-1 px-5 pb-6" : "px-5 py-5"}>
          {children}
        </div>
      </div>
    </dialog>
  );
}
