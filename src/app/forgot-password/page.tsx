"use client";
// Recuperar contraseña — diseño del Login de Gpeople.
// Misma llamada que antes: POST /api/forgot-password { email } → el backend
// envía una contraseña temporal al correo.
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, KeyRound, Mail, ShieldCheck } from "lucide-react";
import AuthShell, { AuthField, AuthSubmit } from "@/components/gp/AuthShell";
import GComprobantesLogo from "@/components/gp/GComprobantesLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000")
        .replace(/\/api$/, "")
        .replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error();
      setEnviado(email.trim());
    } catch {
      setError("No pudimos procesar la solicitud. Verifique el correo e intente de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthShell>
      <div className="flex justify-center mb-7">
        <GComprobantesLogo size={52} theme="light" />
      </div>

      {enviado ? (
        <div className="text-center gp-fade-in">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: "var(--gp-success-bg)" }}
          >
            <CheckCircle2 size={28} style={{ color: "var(--gp-success-text)" }} />
          </div>
          <h1 className="text-[22px] font-bold mb-2" style={{ color: "var(--gp-text-primary)", letterSpacing: "-0.02em" }}>
            Revise su correo
          </h1>
          <p className="text-[14px] leading-relaxed" style={{ color: "var(--gp-text-secondary)" }}>
            Enviamos una <strong>contraseña temporal</strong> a{" "}
            <span style={{ color: "var(--gp-text-primary)" }}>{enviado}</span>. Ingrese con ella y luego cámbiela en
            «Mi cuenta → Cambiar contraseña».
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-[28px] font-bold mb-2" style={{ color: "var(--gp-text-primary)", letterSpacing: "-0.02em" }}>
              ¿Olvidó su contraseña?
            </h1>
            <p className="text-[14px]" style={{ color: "var(--gp-text-secondary)" }}>
              Escriba su correo y le enviaremos una contraseña temporal.
            </p>
          </div>

          {error && (
            <div className="gp-alert gp-alert-danger mb-5 gp-fade-in" style={{ fontSize: 13 }} role="alert">
              <ShieldCheck size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleResetRequest} className="space-y-5">
            <AuthField
              label="Correo"
              icon={Mail}
              type="email"
              required
              placeholder="usuario@garnier.cr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <AuthSubmit loading={enviando} loadingText="Enviando...">
              <KeyRound size={16} /> Enviarme una contraseña temporal
            </AuthSubmit>
          </form>
        </>
      )}

      <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--gp-border)" }}>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium group gp-font-head"
          style={{ color: "var(--gp-green-text)" }}
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Volver a iniciar sesión
        </Link>
      </div>
    </AuthShell>
  );
}
