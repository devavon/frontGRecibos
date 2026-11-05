"use client";
// Roles de GComprobantes y selector en tarjetas (patrón Gpeople).
import React from "react";
import { Check } from "lucide-react";

export interface Role {
  id: number;
  name: string;
  desc: string;
}

export const ROLES: Role[] = [
  { id: 4, name: "Usuario Regular", desc: "Consulta los comprobantes de sus empresas asignadas" },
  { id: 3, name: "Administrador", desc: "Acceso a todas las empresas y gestión de usuarios" },
];

// Selector de rol en tarjetas (patrón Gpeople)
export const RoleOptions: React.FC<{
  roles: Role[];
  value: number;
  onChange: (id: number) => void;
  disabled?: boolean;
}> = ({ roles, value, onChange, disabled }) => (
  <div className="grid gap-2">
    {roles.map((r) => {
      const sel = r.id === value;
      return (
        <button
          type="button"
          key={r.id}
          disabled={disabled}
          onClick={() => onChange(r.id)}
          className="flex items-start gap-3 p-3 rounded-lg border text-left transition disabled:opacity-60"
          style={{
            borderColor: sel ? "var(--gp-green)" : "var(--gp-border)",
            backgroundColor: sel ? "var(--gp-green-light)" : "white",
            boxShadow: sel ? "inset 0 0 0 1px rgba(178,210,52,0.35)" : "none",
          }}
        >
          <span
            className="mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
            style={{
              borderColor: sel ? "var(--gp-green-text)" : "var(--gp-border-dark)",
              backgroundColor: sel ? "var(--gp-green-text)" : "white",
            }}
          >
            {sel && <Check size={10} color="white" />}
          </span>
          <span>
            <span className="block text-[13px] font-medium" style={{ color: "var(--gp-text-primary)" }}>
              {r.name}
            </span>
            <span className="block text-[11px]" style={{ color: "var(--gp-text-muted)" }}>
              {r.desc}
            </span>
          </span>
        </button>
      );
    })}
  </div>
);

