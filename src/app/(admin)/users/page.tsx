'use client';

import UserListDashboard from "@/components/UserListDashboard";
import React from "react";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Usuarios
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Administra usuarios, roles y permisos de acceso
        </p>
      </div>
      <UserListDashboard />
    </div>
  );
}
