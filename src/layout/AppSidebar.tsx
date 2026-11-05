"use client";

// Sidebar — mismo diseño que Gpeople: fondo blanco, grupos en acordeón con
// etiqueta en mayúsculas, ítem activo con degradado verde suave y barra
// lateral verde Garnier, y pie con la marca + versión.
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { ChevronDown, KeyRound, Receipt, Shield, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type UserType = {
  id?: number;
  userId?: number;
  email: string;
  roleId: number;
  name: string;
};

type NavItem = { to: string; icon: LucideIcon; label: string; adminOnly?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: "GENERAL",
    items: [{ to: "/", icon: Receipt, label: "Comprobantes" }],
  },
  {
    label: "ADMINISTRACIÓN",
    items: [{ to: "/users", icon: Shield, label: "Usuarios", adminOnly: true }],
  },
  {
    label: "MI CUENTA",
    items: [{ to: "/change-password", icon: KeyRound, label: "Cambiar contraseña" }],
  },
];

const APP_VERSION = "v3.0.1";
const LS_KEY = "gcomprobantes_sidebar_abiertos";

const isItemActive = (to: string, pathname: string) =>
  to === "/" ? pathname === "/" : pathname.startsWith(to);

const AppSidebar: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { user, isLoading } = useAuth() as { user: UserType | null; isLoading: boolean };

  const isUserAdmin = user?.roleId === 3;

  // Guardia de sesión (misma lógica que antes): sin usuario → /login
  useEffect(() => {
    if (isLoading) return;
    const isSignInRoute = pathname === "/login";
    if (!user && !isSignInRoute) {
      router.replace("/login");
      return;
    }
    if (user && isSignInRoute) {
      router.replace("/");
    }
  }, [isLoading, user, pathname, router]);

  const gruposVisibles = navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.adminOnly || isUserAdmin) }))
    .filter((g) => g.items.length > 0);

  // Acordeón: grupos abiertos (persistido). Por defecto todos abiertos.
  const [abiertos, setAbiertos] = useState<Set<string>>(
    () => new Set(navGroups.map((g) => g.label))
  );

  useEffect(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      if (Array.isArray(guardado)) setAbiertos(new Set(guardado));
    } catch {
      /* estado corrupto → default */
    }
  }, []);

  // El grupo de la ruta actual se abre solo
  useEffect(() => {
    const grupoActivo = navGroups.find((g) => g.items.some((i) => isItemActive(i.to, pathname)));
    if (grupoActivo) {
      setAbiertos((prev) => (prev.has(grupoActivo.label) ? prev : new Set([...prev, grupoActivo.label])));
    }
  }, [pathname]);

  const toggle = (label: string) =>
    setAbiertos((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      try {
        localStorage.setItem(LS_KEY, JSON.stringify([...next]));
      } catch {
        /* sin storage */
      }
      return next;
    });

  const closeMobile = () => {
    if (isMobileOpen) toggleMobileSidebar();
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-[260px] shrink-0 border-r overflow-y-auto flex flex-col
        transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0 lg:w-[240px] lg:z-0
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      style={{ backgroundColor: "var(--gp-sidebar-bg)", borderColor: "var(--gp-border)", top: 0 }}
    >
      {/* Encabezado móvil */}
      <div
        className="flex items-center justify-between p-3 lg:hidden border-b"
        style={{ borderColor: "var(--gp-border)" }}
      >
        <span className="text-sm font-semibold gp-font-head" style={{ color: "var(--gp-green-text)" }}>
          Menú
        </span>
        <button onClick={closeMobile} className="p-1 rounded-md hover:bg-gray-100 transition" aria-label="Cerrar menú">
          <X size={20} style={{ color: "var(--gp-text-secondary)" }} />
        </button>
      </div>

      {/* Navegación (acordeón por grupo) */}
      <nav className="flex-1 py-3">
        {gruposVisibles.map((group) => {
          const abierto = abiertos.has(group.label);
          const tieneActivo = group.items.some((i) => isItemActive(i.to, pathname));
          return (
            <div key={group.label} className="mb-1">
              <button
                onClick={() => toggle(group.label)}
                className="w-full px-4 py-2 text-[10px] font-bold tracking-[0.12em] uppercase flex items-center gap-2 transition hover:bg-[var(--gp-row-hover)] rounded-lg"
                style={{ color: tieneActivo ? "var(--gp-green-text)" : "var(--gp-text-muted)" }}
              >
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: "var(--gp-green-text)", opacity: tieneActivo ? 1 : 0.5 }}
                />
                {group.label}
                {!abierto && (
                  <span
                    className="ml-auto mr-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: "var(--gp-table-header)", color: "var(--gp-text-muted)" }}
                  >
                    {group.items.length}
                  </span>
                )}
                <ChevronDown
                  size={13}
                  className="transition-transform duration-200"
                  style={{
                    marginLeft: abierto ? "auto" : undefined,
                    transform: abierto ? "rotate(0deg)" : "rotate(-90deg)",
                  }}
                />
              </button>
              <div
                className="overflow-hidden transition-all duration-200 ease-in-out"
                style={{ maxHeight: abierto ? `${group.items.length * 44}px` : "0px", opacity: abierto ? 1 : 0 }}
              >
                {group.items.map((item) => {
                  const active = isItemActive(item.to, pathname);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      href={item.to}
                      onClick={closeMobile}
                      className={`relative flex items-center gap-2.5 px-3.5 py-2 mx-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                        active
                          ? "text-[var(--gp-green-text)] font-semibold"
                          : "text-[var(--gp-text-secondary)] hover:bg-[var(--gp-row-hover)] hover:text-[#333] hover:translate-x-0.5"
                      }`}
                      style={
                        active
                          ? {
                              background:
                                "linear-gradient(90deg, var(--gp-green-light) 0%, rgba(244, 249, 227, 0.4) 100%)",
                              boxShadow: "inset 0 0 0 1px rgba(178, 210, 52, 0.18)",
                            }
                          : {}
                      }
                    >
                      {active && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                          style={{
                            background: "linear-gradient(180deg, var(--gp-green) 0%, var(--gp-green-dark) 100%)",
                            boxShadow: "0 0 8px rgba(178, 210, 52, 0.4)",
                          }}
                        />
                      )}
                      <Icon size={17} style={{ color: active ? "var(--gp-green-text)" : undefined }} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Pie: marca + versión */}
      <div className="p-3 border-t" style={{ borderColor: "var(--gp-border)" }}>
        <div className="text-[11px] font-semibold mb-0.5 gp-font-head" style={{ color: "var(--gp-text-secondary)" }}>
          Corporación Garnier
        </div>
        <div className="text-[10px] flex items-center justify-between" style={{ color: "var(--gp-text-muted)" }}>
          <span>GComprobantes</span>
          <span className="px-1.5 py-0.5 rounded-full font-mono" style={{ backgroundColor: "var(--gp-table-header)" }}>
            {APP_VERSION}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
