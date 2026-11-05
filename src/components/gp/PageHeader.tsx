// PageHeader — Encabezado consistente para todas las páginas (patrón Gpeople).
//
// Uso:
//   <PageHeader icon={Receipt} title="Comprobantes" subtitle="..." badge={total}
//     action={<button className="gp-btn gp-btn-primary">Nuevo</button>} />
import React from "react";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
};

export default function PageHeader({ icon: Icon, title, subtitle, badge, action }: Props) {
  return (
    <div className="flex items-center justify-between mb-5 flex-wrap gap-3 gp-fade-in">
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--gp-green-light)" }}
          >
            <Icon size={22} style={{ color: "var(--gp-green-text)" }} />
          </div>
        )}
        <div>
          <h1
            className="text-xl font-semibold flex items-center gap-2"
            style={{ color: "var(--gp-text-primary)" }}
          >
            {title}
            {badge !== undefined && badge !== null && (
              <span
                className="text-[11px] font-normal px-2 py-0.5 rounded-full tabular-nums"
                style={{ backgroundColor: "var(--gp-table-header)", color: "var(--gp-text-muted)" }}
              >
                {badge}
              </span>
            )}
          </h1>
          {subtitle && (
            <p className="text-[12px] mt-0.5" style={{ color: "var(--gp-text-muted)" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex gap-2 flex-wrap">{action}</div>}
    </div>
  );
}
