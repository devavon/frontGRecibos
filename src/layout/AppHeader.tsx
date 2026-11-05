"use client";

// Topbar — mismo diseño que Gpeople: barra oscura (#3f3f42) de 52px con logo
// en versión clara, y a la derecha el usuario (inicial en disco verde,
// nombre y botón de cerrar sesión).
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import GComprobantesLogo from "@/components/gp/GComprobantesLogo";
import Link from "next/link";
import React from "react";
import { LogOut, Menu } from "lucide-react";

type AuthUser = { name?: string; email?: string; roleName?: string; roleId?: number } | null;

const AppHeader: React.FC = () => {
  const { toggleMobileSidebar } = useSidebar();
  const { user, logout } = useAuth() as { user: AuthUser; logout: () => void };

  const rawName = user?.name || user?.email?.split("@")[0] || "Usuario";
  const userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const roleLabel = user?.roleId === 3 ? "Administrador" : user?.roleName ? user.roleName : "";

  return (
    <header
      className="h-[52px] flex items-center justify-between px-3 sm:px-4 shrink-0 relative z-50"
      style={{ backgroundColor: "var(--gp-header-bg)" }}
    >
      {/* Izquierda: hamburguesa (móvil) + logo */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleMobileSidebar}
          className="p-1.5 rounded-md hover:bg-white/10 transition lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={20} className="text-gray-300" />
        </button>
        <Link href="/" aria-label="Ir al inicio">
          <GComprobantesLogo size="sm" theme="dark" />
        </Link>
      </div>

      {/* Derecha: usuario */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-gray-700">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ backgroundColor: "var(--gp-green-text)", color: "white" }}
          >
            {userName.charAt(0)}
          </div>
          <div className="hidden lg:flex flex-col leading-tight max-w-[160px]">
            <span className="text-xs text-gray-300 truncate">{userName}</span>
            {roleLabel && (
              <span className="text-[10px] text-gray-500 truncate capitalize">{roleLabel}</span>
            )}
          </div>
          <button
            onClick={logout}
            className="p-1 rounded hover:bg-white/10 transition"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut size={15} className="text-gray-500" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
