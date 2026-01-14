import type { Metadata } from "next";
import React from "react";
import { Datos } from "@/components/ecommerce/Datos";

export const metadata: Metadata = {
  title: "GComprobantes - Garnier y Garnier",
  description: "Gestión de comprobantes de pago - Garnier y Garnier",
};

const mockUser = {
  userRole: "admin",
  userCompanies: ["WW COSTA RICA SRL", "PRUEBA EMPRESA S.A."],
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* * Header de página * */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Comprobantes de Pago
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona y consulta los comprobantes registrados
          </p>
        </div>
      </div>

      {/* * Contenido principal * */}
      <Datos
        userRole={mockUser.userRole as "admin" | "contador" | "tesoreria"}
        userCompanies={mockUser.userCompanies}
      />
    </div>
  );
}


/* import { redirect } from "next/navigation";

export default function RootPage() {
  // Esto hace que apenas entres, te mande a la carpeta /login que creamos
  redirect("/login");
} */