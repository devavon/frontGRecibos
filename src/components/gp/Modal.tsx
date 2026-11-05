// Modal — Contenedor de diálogo con el estilo de Gpeople (overlay negro 40%,
// tarjeta blanca rounded-xl, título Poppins 15px, pie gris claro con acciones).
//
// Uso:
//   <Modal open title="Crear usuario" icon={UserPlus} onClose={...}
//     footer={<><button className="gp-btn gp-btn-secondary">Cancelar</button>...</>}>
//     ...contenido...
//   </Modal>
"use client";
import React, { useEffect } from "react";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  open: boolean;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** Evita cerrar con clic afuera / Escape mientras se guarda */
  busy?: boolean;
};

const WIDTHS = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };

export default function Modal({
  open,
  title,
  subtitle,
  icon: Icon,
  onClose,
  children,
  footer,
  size = "md",
  busy = false,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[100000] flex items-center justify-center p-4"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`bg-white rounded-xl w-full ${WIDTHS[size]} shadow-xl max-h-[90vh] flex flex-col gp-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
          <div className="flex items-start gap-3 min-w-0">
            {Icon && (
              <div
                className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--gp-green-light)" }}
              >
                <Icon size={18} style={{ color: "var(--gp-green-text)" }} />
              </div>
            )}
            <div className="min-w-0">
              <h2
                className="text-[15px] font-semibold truncate"
                style={{ color: "var(--gp-text-primary)" }}
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-[12px] mt-0.5" style={{ color: "var(--gp-text-muted)" }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="shrink-0 p-1 rounded hover:bg-gray-100 disabled:opacity-40"
            aria-label="Cerrar"
          >
            <X size={18} style={{ color: "var(--gp-text-secondary)" }} />
          </button>
        </div>

        <div className="px-5 pb-5 overflow-y-auto">{children}</div>

        {footer && (
          <div
            className="flex justify-end gap-2 px-5 py-3.5 border-t rounded-b-xl"
            style={{ borderColor: "var(--gp-border)", backgroundColor: "#fafafa" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
