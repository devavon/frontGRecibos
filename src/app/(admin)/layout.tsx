"use client";

// Layout principal — misma estructura que Gpeople (MainLayout):
//   Topbar oscuro (52px) arriba · Sidebar blanco (240px) a la izquierda ·
//   Breadcrumbs + contenido con scroll propio a la derecha.
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import Breadcrumbs from "@/layout/Breadcrumbs";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <Backdrop />
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Breadcrumbs />
          <main
            className="flex-1 overflow-y-auto p-3 sm:p-5"
            style={{ backgroundColor: "var(--gp-body-bg)" }}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
