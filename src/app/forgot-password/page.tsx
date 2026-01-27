"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

 const handleResetRequest = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    // Cambia esto:
  const response = await fetch("http://localhost:3000/api/forgot-password", {// Cambia esto directo
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "¡Listo!",
        text: data.message,
        confirmButtonColor: "#99bc39"
      });
    } else {
      throw new Error();
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No pudimos conectar con el servidor.",
      confirmButtonColor: "#d33"
    });
  }
};
  return (
    <div 
      style={{ 
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: "url('/images/brand/background-login.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 99999,
        padding: '24px'
      }}
    >
      <div 
        style={{ 
          backgroundColor: 'white',
          width: '100%',
          maxWidth: '500px',
          borderRadius: '60px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '50px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* TÍTULO Y SUBTÍTULO */}
        <h2 className="text-[32px] font-semibold text-[#99bc39] mb-2 text-center">
          ¿Problemas para entrar?
        </h2>
        <p className="text-gray-400 text-sm mb-10 text-center font-medium">
          Ingresa tu correo y te ayudaremos a restablecer tu contraseña.
        </p>

        {/* FORMULARIO */}
        <form onSubmit={handleResetRequest} className="w-full space-y-6">
          <div className="flex flex-col">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99bc39]">
                <Mail size={20} />
              </span>
              <input
                type="email"
                required
                placeholder="tu-correo@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#f3f4f6] border-none rounded-2xl outline-none"
              />
            </div>
          </div>

          <button className="w-full bg-[#99bc39] hover:bg-[#86a532] text-white font-bold py-5 rounded-2xl shadow-lg uppercase text-sm mt-4 transition-all">
            Enviar Instrucciones
          </button>
        </form>

        {/* BOTÓN VOLVER */}
        <div className="mt-8">
          <Link href="/signin" className="flex items-center text-gray-400 hover:text-[#99bc39] transition-colors font-medium text-sm group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Volver al Inicio de Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}