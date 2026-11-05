"use client";
// Contraseña nueva obligatoria (enlace del correo o login con clave temporal).
// Misma llamada que antes: POST /api/update-password { userId, newPassword }.
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import PasswordForm from "@/components/gp/PasswordForm";

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId"); // ID del usuario que trae el enlace

  const guardar = async (password: string) => {
    let response: Response;
    try {
      response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword: password }),
      });
    } catch {
      throw new Error("Error de conexión con el servidor.");
    }

    if (!response.ok) throw new Error("No se pudo actualizar la contraseña.");

    toast.success("Contraseña actualizada. Ya puede iniciar sesión.");
    setTimeout(() => {
      window.location.href = "/signin";
    }, 900);
  };

  return (
    <PasswordForm
      title="Cambio de contraseña requerido"
      subtitle="Por seguridad, defina una contraseña personal antes de continuar."
      submitLabel="Actualizar contraseña"
      onSubmit={guardar}
      backHref="/login"
      backLabel="Volver a iniciar sesión"
    />
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <span className="gp-spinner" />
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
