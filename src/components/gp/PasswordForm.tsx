"use client";
// PasswordForm — Formulario de nueva contraseña con el diseño de
// "Cambiar contraseña" de Gpeople: icono de escudo, campos con candado,
// medidor de fortaleza en vivo y confirmación.
// Lo usan /change-password (cambio voluntario) y /reset-password (forzado).
import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Check, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import AuthShell from "@/components/gp/AuthShell";
import GComprobantesLogo from "@/components/gp/GComprobantesLogo";

type Props = {
  title: string;
  subtitle: string;
  submitLabel?: string;
  /** Guarda la contraseña; lanza Error con el mensaje a mostrar si falla */
  onSubmit: (newPassword: string) => Promise<void>;
  backHref?: string;
  backLabel?: string;
};

const MIN_LEN = 8;

export default function PasswordForm({
  title,
  subtitle,
  submitLabel = "Guardar nueva contraseña",
  onSubmit,
  backHref,
  backLabel,
}: Props) {
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [show, setShow] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reglas = [
    { ok: nueva.length >= MIN_LEN, label: `Mínimo ${MIN_LEN} caracteres` },
    { ok: /[A-Z]/.test(nueva), label: "Una mayúscula" },
    { ok: /[a-z]/.test(nueva), label: "Una minúscula" },
    { ok: /\d/.test(nueva), label: "Un número" },
  ];
  const fortaleza = reglas.filter((r) => r.ok).length;
  const esValida = nueva.length >= MIN_LEN && nueva === confirmar;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (nueva.length < MIN_LEN) return setError(`La contraseña debe tener al menos ${MIN_LEN} caracteres.`);
    if (nueva !== confirmar) return setError("Las contraseñas no coinciden.");
    setEnviando(true);
    try {
      await onSubmit(nueva);
    } catch (err) {
      setError((err as Error).message || "No se pudo actualizar la contraseña.");
    } finally {
      setEnviando(false);
    }
  };

  const labelCls = "block text-[11px] uppercase tracking-wider font-bold mb-1.5";

  return (
    <AuthShell variant="dark" maxWidth={448}>
      <div className="text-center mb-5">
        <div
          className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
          style={{ backgroundColor: "var(--gp-success-bg)" }}
        >
          <ShieldCheck size={28} style={{ color: "var(--gp-success-text)" }} />
        </div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--gp-text-primary)" }}>
          {title}
        </h1>
        <p className="text-[12px] mt-1.5" style={{ color: "var(--gp-text-muted)" }}>
          {subtitle}
        </p>
      </div>

      {error && (
        <div className="gp-alert gp-alert-danger mb-3 gp-fade-in" role="alert">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={enviar} className="space-y-3">
        <div>
          <label className={labelCls} style={{ color: "var(--gp-text-muted)" }}>
            Nueva contraseña
          </label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--gp-text-muted)" }} />
            <input
              type={show ? "text" : "password"}
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              autoComplete="new-password"
              className="gp-input"
              style={{ height: 40, paddingLeft: 36, paddingRight: 36 }}
              required
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
              style={{ color: "var(--gp-text-muted)" }}
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {nueva && (
            <div className="mt-2">
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-1 flex-1 rounded-full transition"
                    style={{
                      backgroundColor:
                        n <= fortaleza ? (fortaleza < 3 ? "#ef4444" : fortaleza < 4 ? "#f59e0b" : "#10b981") : "#e5e7eb",
                    }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                {reglas.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center gap-1 text-[10px]"
                    style={{ color: r.ok ? "#10b981" : "var(--gp-text-muted)" }}
                  >
                    <Check size={9} /> {r.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className={labelCls} style={{ color: "var(--gp-text-muted)" }}>
            Confirmar nueva contraseña
          </label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--gp-text-muted)" }} />
            <input
              type={show ? "text" : "password"}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              autoComplete="new-password"
              className="gp-input"
              style={{
                height: 40,
                paddingLeft: 36,
                borderColor: confirmar && nueva !== confirmar ? "#ef4444" : undefined,
              }}
              required
            />
          </div>
          {confirmar && nueva !== confirmar && (
            <div className="text-[10px] mt-1 flex items-center gap-1" style={{ color: "#dc2626" }}>
              <AlertCircle size={10} /> Las contraseñas no coinciden
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={enviando || !esValida}
          className="gp-btn gp-btn-primary w-full"
          style={{ height: 40, fontSize: 13 }}
        >
          {enviando ? (
            <>
              <span className="gp-spinner gp-spinner-sm" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
              Guardando...
            </>
          ) : (
            submitLabel
          )}
        </button>

        {backHref && (
          <Link
            href={backHref}
            className="w-full flex items-center justify-center gap-1.5 text-[12px] py-2 transition hover:text-[var(--gp-green-text)]"
            style={{ color: "var(--gp-text-muted)" }}
          >
            <ArrowLeft size={12} /> {backLabel || "Volver"}
          </Link>
        )}
      </form>

      <div className="flex justify-center mt-5 pt-4 border-t" style={{ borderColor: "var(--gp-border)" }}>
        <GComprobantesLogo size="sm" theme="light" />
      </div>
    </AuthShell>
  );
}
