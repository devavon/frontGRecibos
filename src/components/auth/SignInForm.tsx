"use client";
// Inicio de sesión — mismo diseño que el Login de Gpeople (tarjeta blanca
// centrada, banda diagonal verde, logo, campos altos y botón verde AA).
// Lógica igual a la anterior: login() del AuthContext, redirección a
// /reset-password si el backend exige cambio, y a "/" al entrar.
import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthShell, { AuthField, AuthSubmit } from "@/components/gp/AuthShell";
import GComprobantesLogo from "@/components/gp/GComprobantesLogo";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { login } = useAuth() as any;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const result = await login(email, password);

      if (result?.requirePasswordChange) {
        window.location.href = `/reset-password?userId=${result.userId}`;
        return;
      }

      if (result?.token) {
        localStorage.setItem("user_name", result.user?.name || "Usuario");
        window.location.href = "/";
        return;
      }

      if (result?.error && result.status && result.status !== 401 && result.status !== 403) {
        setError("No se pudo conectar con el servidor. Intente de nuevo en unos minutos.");
      } else if (result?.error && !result.status) {
        setError("Sin conexión con el servidor. Verifique su red e intente de nuevo.");
      } else {
        setError("Correo o contraseña incorrectos.");
      }
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthShell>
      <div className="flex justify-center mb-7">
        <GComprobantesLogo size={52} theme="light" />
      </div>

      <div className="mb-8">
        <h1
          className="text-[28px] font-bold mb-2"
          style={{ color: "var(--gp-text-primary)", letterSpacing: "-0.02em" }}
        >
          Iniciar sesión
        </h1>
        <p className="text-[14px]" style={{ color: "var(--gp-text-secondary)" }}>
          Ingrese sus credenciales corporativas para continuar
        </p>
      </div>

      {error && (
        <div className="gp-alert gp-alert-danger mb-5 gp-fade-in" style={{ fontSize: 13 }} role="alert">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <AuthField
          label="Correo"
          icon={Mail}
          type="email"
          placeholder="usuario@garnier.cr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />

        <div>
          <AuthField
            label="Contraseña"
            icon={Lock}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            right={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 rounded"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                style={{ color: "var(--gp-text-muted)" }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
          />
        </div>

        <AuthSubmit loading={cargando} loadingText="Verificando credenciales...">
          Iniciar sesión →
        </AuthSubmit>
      </form>

      <div className="mt-5">
        <Link
          href="/forgot-password"
          className="text-[13px] font-medium underline-offset-2 hover:underline gp-font-head"
          style={{ color: "var(--gp-green-text)" }}
        >
          ¿Olvidó su contraseña?
        </Link>
      </div>

      <div
        className="mt-8 pt-6 border-t flex items-center justify-between text-[11px]"
        style={{ borderColor: "var(--gp-border)", color: "var(--gp-text-muted)" }}
      >
        <span>v3.0.1</span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={12} style={{ color: "var(--gp-green-text)" }} />
          Sesión segura
        </span>
      </div>
    </AuthShell>
  );
}
