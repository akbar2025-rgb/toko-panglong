"use client";

import { Dialog } from "@/components/dialog";
import type { ReactNode } from "react";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  tone = "primary",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  tone?: "primary" | "danger";
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="text-sm leading-relaxed text-muted">{description}</div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="btn btn-secondary">
          Batal
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`btn ${tone === "danger" ? "btn-danger" : "btn-primary"}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
