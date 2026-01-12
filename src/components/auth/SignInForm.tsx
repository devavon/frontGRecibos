"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useAuth } from '../../context/AuthContext';
import { EyeCloseIcon, EyeIcon, UserIcon, LockIcon } from "@/icons"; 

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(email, password);
      if (result?.token) {
       /*  router.push("/") */
       window.location.href = "/";;
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Credenciales incorrectas" });
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
        backgroundRepeat: 'no-repeat',
        zIndex: 99999,
        padding: '24px' // Esto crea el espacio para que el cuadro no pegue a los bordes
      }}
    >
      {/* EL CUADRO BLANCO CON BORDES REDONDEADOS (BORDER-RADIUS) */}
      <div 
        style={{ 
          backgroundColor: 'white',
          width: '100%',
          maxWidth: '500px',
          borderRadius: '60px', // Bordes bien circulares como pediste
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '50px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center">
            <img 
              src="/images/logo/logo-g.png" 
              alt="Logo G" 
              className="w-[70px] h-auto object-contain" 
            />
            <h1 className="text-[48px] font-bold text-[#4B5563] ml-1 tracking-tighter">Comprobantes</h1>
          </div>
          <p className="text-[#9CA3AF] text-sm -mt-2 ml-24 font-medium italic">by Garnier</p>
        </div>

        <h2 className="text-[36px] font-semibold text-[#99bc39] mb-1 text-center">Iniciar Sesión</h2>
        <p className="text-gray-400 text-sm mb-10 text-center font-medium">Ingresa los credenciales para continuar</p>

        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div className="flex flex-col">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Correo</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99bc39]"><UserIcon size={20} /></span>
              <input
                type="email"
                placeholder="usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#f3f4f6] border-none rounded-2xl outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99bc39]"><LockIcon size={20} /></span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-[#f3f4f6] border-none rounded-2xl outline-none"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeIcon size={22} /> : <EyeCloseIcon size={22} />}
              </button>
            </div>
          </div>

          <button className="w-full bg-[#99bc39] hover:bg-[#86a532] text-white font-bold py-5 rounded-2xl shadow-lg uppercase text-sm mt-4">
            Entrar
          </button>
        </form>

        <div className="mt-14 text-[11px] text-gray-300 tracking-[0.3em] font-semibold uppercase">
          V. 3.0.1 | 10.48.3 | 8.3.16
        </div>
      </div>
    </div>
  );
}





/* "use client";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import { useAuth } from '../../context/AuthContext';


export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      Swal.fire({
        icon: "error",
        title: "Campos requeridos",
        text: "Por favor complete todos los campos",
      });
      return;
    }

    try {
      const result = await login(email, password);

      if (result && result.token) {
        router.push("/");
        Swal.fire({
          title: "Bienvenido",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de autenticación",
          text: result?.message || "Credenciales incorrectas",
        });
      }
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: error.response?.data?.error || "No se pudo conectar con el servidor",
      });
    }
  };

  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-6">
      * Logo móvil - solo visible en pantallas pequeñas *
      <div className="lg:hidden text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 dark:text-white">GRecibos</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Garnier y Garnier</p>
      </div>

      <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
        Iniciar Sesión
      </h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Ingresa tus credenciales para acceder al sistema
      </p>

      <form onSubmit={handleLogin} className="space-y-5">
        * Campo Email *
        <div>
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">
            Correo electrónico <span className="text-error-500">*</span>
          </p>
          <Input
            id="email"
            placeholder="usuario@empresa.com"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
        </div>

        * Campo Password *
        <div>
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">
            Contraseña <span className="text-error-500">*</span>
          </p>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
              )}
            </span>
          </div>
        </div>

        <div className="pt-3">
          <Button className="w-full" size="sm">
            Ingresar
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Gestión de comprobantes de pago
        </p>
      </div>
    </div>
  );
}

dentro de * * lo que estaba comentado */