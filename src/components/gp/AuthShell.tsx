// AuthShell — Fondo + tarjeta de las pantallas de acceso (igual que Gpeople).
//
//   variant="light" → Login de Gpeople: fondo claro con halos verde/dorado,
//                      acento diagonal y tarjeta blanca con banda de marca.
//   variant="dark"  → Cambiar contraseña de Gpeople: degradado gris Garnier
//                      con halo verde y tarjeta gp-card.
import React from "react";

type Props = {
  children: React.ReactNode;
  variant?: "light" | "dark";
  maxWidth?: number;
};

export default function AuthShell({ children, variant = "light", maxWidth = 440 }: Props) {
  if (variant === "dark") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #3f3f42 0%, var(--gp-gris) 100%)" }}
      >
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, var(--gp-green) 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div className="gp-card p-8 w-full relative z-10 gp-fade-in" style={{ maxWidth }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at top, rgba(178,210,52,0.12) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(196,122,32,0.06) 0%, transparent 50%), var(--gp-body-bg)",
      }}
    >
      {/* Acento diagonal de marca (motivo del isotipo, muy sutil) */}
      <div
        className="gp-diagonal-accent absolute -top-10 -left-10 w-[260px] h-[260px] opacity-[0.07] pointer-events-none"
        aria-hidden="true"
      />
      {/* Orbes decorativos */}
      <div
        className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--gp-green) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-[480px] h-[480px] rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--gp-gold) 0%, transparent 70%)" }}
      />

      <main className="w-full relative gp-fade-in" style={{ maxWidth }}>
        <div
          className="bg-white rounded-2xl p-8 sm:p-10 relative"
          style={{
            border: "1px solid var(--gp-border)",
            boxShadow: "0 20px 60px -10px rgba(15,23,42,0.12), 0 8px 20px -6px rgba(15,23,42,0.06)",
          }}
        >
          {/* Banda superior con acento diagonal de marca */}
          <div className="gp-diagonal-band absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl overflow-hidden" />
          {children}
        </div>
      </main>
    </div>
  );
}

// Campo de las pantallas de acceso: etiqueta en mayúsculas + input alto con
// icono, fondo #fafafa y halo verde al enfocar (Login de Gpeople).
export function AuthField({
  label,
  icon: Icon,
  right,
  ...inputProps
}: {
  label: string;
  icon: React.ElementType;
  right?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        className="block text-[11px] uppercase tracking-[0.08em] mb-2 font-semibold"
        style={{ color: "var(--gp-text-muted)" }}
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--gp-text-muted)" }}
        />
        <input
          {...inputProps}
          className="gp-auth-input w-full h-12 pl-11 pr-11 rounded-xl text-[14px] outline-none transition"
        />
        {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
    </div>
  );
}

// Botón principal de las pantallas de acceso (degradado verde AA)
export function AuthSubmit({
  loading,
  loadingText,
  children,
  disabled,
}: {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="gp-auth-submit w-full h-12 rounded-xl text-white font-semibold text-[14px] flex items-center justify-center gap-2 mt-2 gp-font-head disabled:opacity-60"
      style={{ cursor: loading ? "wait" : undefined }}
    >
      {loading ? (
        <>
          <span className="gp-spinner gp-spinner-sm" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
          {loadingText || "Procesando..."}
        </>
      ) : (
        children
      )}
    </button>
  );
}
