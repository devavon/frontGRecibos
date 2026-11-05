import type { Metadata } from "next";
import React from "react";
import { Datos } from "@/components/ecommerce/Datos";

export const metadata: Metadata = {
  title: "Comprobantes — GComprobantes Garnier",
  description: "Gestión de comprobantes de pago — Corporación Garnier",
};

const mockUser = {
  userRole: "admin",
  userCompanies: ["WW COSTA RICA SRL", "PRUEBA EMPRESA S.A."],
};

export default function Dashboard() {
  return (
    <Datos
      userRole={mockUser.userRole as "admin" | "contador" | "tesoreria"}
      userCompanies={mockUser.userCompanies}
    />
  );
}
