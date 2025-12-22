"use client";
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
      {/* Logo móvil - solo visible en pantallas pequeñas */}
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
        {/* Campo Email */}
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

        {/* Campo Password */}
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
