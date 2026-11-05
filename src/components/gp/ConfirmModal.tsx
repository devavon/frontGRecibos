// ConfirmModal — Confirmación de la marca (igual que Gpeople). Reemplaza los
// Swal.fire({ showCancelButton }) para acciones sensibles.
//
//   <ConfirmModal open={!!aBorrar} title="¿Eliminar usuario?" tone="danger"
//     onCancel={() => setABorrar(null)} onConfirm={eliminar}>Texto…</ConfirmModal>
"use client";
import React from "react";
import { AlertTriangle, HelpCircle, X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** warning: irreversible/externo · danger: destructivo · info: neutra */
  tone?: "warning" | "danger" | "info";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "warning",
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  const toneColor =
    tone === "danger"
      ? "var(--gp-danger-text)"
      : tone === "info"
        ? "var(--gp-green-text)"
        : "var(--gp-warning-text)";
  const toneBg =
    tone === "danger"
      ? "var(--gp-danger-bg)"
      : tone === "info"
        ? "var(--gp-green-light)"
        : "var(--gp-warning-bg)";
  const Icon = tone === "info" ? HelpCircle : AlertTriangle;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[100000] flex items-center justify-center p-4"
      onClick={() => !loading && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="bg-white rounded-xl w-full max-w-md shadow-xl gp-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5 pb-4">
          <div
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: toneBg }}
          >
            <Icon size={18} style={{ color: toneColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[14px] font-semibold" style={{ color: "var(--gp-text-primary)" }}>
              {title}
            </h2>
            {children && (
              <div
                className="text-[12px] mt-1.5 leading-relaxed"
                style={{ color: "var(--gp-text-secondary)" }}
              >
                {children}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="shrink-0 p-1 rounded hover:bg-gray-100"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
        <div
          className="flex justify-end gap-2 px-5 py-3.5 border-t rounded-b-xl"
          style={{ borderColor: "var(--gp-border)", backgroundColor: "#fafafa" }}
        >
          <button type="button" onClick={onCancel} disabled={loading} className="gp-btn gp-btn-secondary">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="gp-btn text-white"
            style={{ backgroundColor: toneColor }}
          >
            {loading ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
