"use client";
// Cambio voluntario de contraseña (menú "Mi cuenta"). Misma llamada que antes:
// POST /api/update-password { userId, newPassword }.
import React from "react";
import toast from "react-hot-toast";
import PasswordForm from "@/components/gp/PasswordForm";

export default function ChangePasswordPage() {
  const guardar = async (password: string) => {
    let user: { userId?: number; id?: number } = {};
    try {
      user = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      /* usuario corrupto en storage */
    }

    let response: Response;
    try {
      response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId || user.id, newPassword: password }),
      });
    } catch {
      throw new Error("Error de conexión con el servidor.");
    }

    if (!response.ok) throw new Error("No se pudo actualizar la contraseña.");

    toast.success("Contraseña actualizada");
    setTimeout(() => {
      window.location.href = "/";
    }, 900);
  };

  return (
    <PasswordForm
      title="Cambiar mi contraseña"
      subtitle="Defina una nueva contraseña para su cuenta."
      onSubmit={guardar}
      backHref="/"
      backLabel="Volver a comprobantes"
    />
  );
}
