"use client";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      Swal.fire({
        icon: "error",
        title: "Llenar campos vacios",
        text: "Por favor llene todos los datos solicitados",
      });
      return;
    }

    try {
      await axios.post("http://localhost:3000/register", {
        name,
        email,
        password,
        companies: ["INVERSIONES INMOBILIARIAS BONAVISTA"], 
      });

      Swal.fire({
        title: "Registrado correctamente",
        icon: "success",
      });

      router.push("/signin");
    } catch (error) {
      console.error("Error en el registro:", error);
      Swal.fire({
        icon: "error",
        title: "Error en el registro",
        text: "Hubo un problema al crear la cuenta. Intente de nuevo.",
      });
    }
  };

  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
      <h1 className="mb-6 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
        Sign Up
      </h1>
      <div>
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Campo Full Name */}
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
              Full Name <span className="text-error-500">*</span>
            </p>
            <Input
              id="name"
              placeholder="Jhon Doe"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
              onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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
              Sign Up
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
            Already have an account? {""}
            <Link
              href="/signin"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}