"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId"); // Extrae el ID del usuario del link del correo
  const [password, setPassword] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword: password }),
      });

      if (response.ok) {
        Swal.fire("¡Éxito!", "Contraseña actualizada correctamente.", "success")
          .then(() => window.location.href = "/signin");
      } else {
        Swal.fire("Error", "No se pudo actualizar la contraseña.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error de conexión con el servidor.", "error");
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
      <form onSubmit={handleUpdate} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ color: '#99bc39', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>Nueva Contraseña</h2>
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#99bc39' }}><Lock size={20} /></span>
          <input 
            type="password" 
            placeholder="Ingresa tu nueva clave" 
            required 
            style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '15px', border: '1px solid #ddd', outline: 'none' }}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" style={{ width: '100%', backgroundColor: '#99bc39', color: 'white', padding: '15px', borderRadius: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
          ACTUALIZAR CONTRASEÑA
        </button>
      </form>
    </div>
  );
}