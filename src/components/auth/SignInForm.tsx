"use client";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
// import axios from "axios"; // Mejor eliminar si no se usa directamente aquí
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

// ⚠️ IMPORTACIÓN NECESARIA DEL CONTEXTO
import { useAuth } from '../../context/AuthContext'; 


export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // ⚠️ OBTENER LA FUNCIÓN DE LOGIN DEL CONTEXTO
  const { login } = useAuth();

  // Función de Login MODIFICADA para usar el contexto
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      Swal.fire({
        icon: "error",
        title: "Llenar campos vacios",
        text: "Por favor llene todos los datos solicitados",
      });
      return;
    }
    
    // ⚠️ NUEVA LÓGICA: Llamar a la función 'login' del AuthContext
    try {
      // El login() ya maneja la llamada a axios, el seteo de localStorage y el error
      const result = await login(email, password); 

      // *** CORRECCIÓN CLAVE: Verificar si el token existe en el resultado ***
      if (result && result.token) { 
        // Si el login fue exitoso (el token ya está guardado en el contexto y localStorage)
        router.push("/");
        Swal.fire({
          title: "Bienvenido",
          icon: "success",
        });
      } else {
        // Si el token no está presente, algo salió mal
        Swal.fire({
          icon: "error",
          title: "Error en el inicio de sesión",
          // Usamos el mensaje de error que nos devuelve el contexto o un genérico
          text: result?.message || "Credenciales incorrectas o problema con la respuesta del servidor.",
        });
      }
    } catch (error: any) { // Explicitly type error as 'any' for simpler access to properties
      console.error("Error desconocido al iniciar sesión:", error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: error.response?.data?.error || "Hubo un problema al intentar conectar con el servidor.",
      });
    }
  };

  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
      <h1 className="mb-6 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
        Sign In
      </h1>
      <div>
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Campo Email */}
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
              Email <span className="text-error-500">*</span>
            </p>
            <Input
              id="email"
              placeholder="info@gmail.com"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
          </div>

          {/* Campo Password */}
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
              Password <span className="text-error-500">*</span>
            </p>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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

          <div className="pt-2">
            <Button className="w-full" size="sm">
              Sign in
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
            Don&apos;t have an account? {""}
            <Link
              href="/signup"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
