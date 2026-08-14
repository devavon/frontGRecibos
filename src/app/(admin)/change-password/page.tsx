"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { Lock } from "lucide-react";

export default function ChangePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire("Error", "Las contraseñas no coinciden", "error");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("USER FRONT:", user);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user.userId || user.id,
          newPassword: password
        })
      });

      if (response.ok) {
        Swal.fire("Éxito", "Contraseña actualizada", "success")
          .then(() => window.location.href = "/");
      } else {
        Swal.fire("Error", "No se pudo actualizar la contraseña", "error");
      }

    } catch (error) {
      Swal.fire("Error", "Error de conexión", "error");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f3f4f6' }}>
      <form onSubmit={handleUpdate} style={{ background: 'white', padding: '40px', borderRadius: '20px', width: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#99bc39' }}>
          Cambiar Contraseña
        </h2>

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '12px', marginBottom: '15px' }}
        />

        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '12px', marginBottom: '20px' }}
        />

        <button style={{ width: '100%', background: '#99bc39', color: 'white', padding: '12px' }}>
          Cambiar Contraseña
        </button>
      </form>
    </div>
  );
}