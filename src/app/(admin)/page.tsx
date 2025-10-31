import type { Metadata } from "next";
import React from "react";
import { Nav } from "@/components/ecommerce/Nav";
import { Datos } from "@/components/ecommerce/Datos"; 
// ⚠️ 1. Importar el componente de pruebas
/* import { AdminDashboard } from "@/components/AdminDashboard"; 
 */
export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

// ⚠️ Mantenemos el mockUser por ahora, pero las pruebas de seguridad usan el contexto real.
const mockUser = {
  userRole: "admin", 
  userCompanies: ["WW COSTA RICA SRL", "PRUEBA EMPRESA S.A."],
};

export default function Ecommerce() {
  return (
    // ⚠️ Nota: Cambié el segundo div a col-span-12 para que ocupe todo el ancho 
    // y el Dashboard de pruebas se vea bien, pero si lo quieres cambiar, es solo una sugerencia de diseño.
    <div className="grid grid-cols-12 gap-4 md:gap-6"> 

      {/* Tus componentes existentes */}
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <Nav />
      </div>

      <div className="col-span-12 space-y-6 xl:col-span-7">
        <Datos
          userRole={mockUser.userRole as "admin" | "contador" | "tesoreria"}
          userCompanies={mockUser.userCompanies}
        />
      </div>

      {/* ⚠️ 2. Renderizar el componente de pruebas al final de la página */}
      {/* <div className="col-span-12 mt-6">
        <AdminDashboard />
      </div> */}
      
    </div>
  );
}