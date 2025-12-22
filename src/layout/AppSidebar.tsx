"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { ChevronDownIcon, HorizontaLDots } from "../icons/index";
import { useAuth } from "@/hooks/useAuth";

// Iconos simples en SVG
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

type UserType = {
  id: number;
  email: string;
  roleId: number;
  name: string;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};


// ----------------------------------------------------------------------
// DEFINICIÓN DE ELEMENTOS BASE (VISTO POR TODOS)
// ----------------------------------------------------------------------
const defaultNavItems: NavItem[] = [
    {
        icon: <GridIcon />,
        name: "Página principal",
        subItems: [{ name: "Facturas", path: "/", pro: false }],
    },
    {
        icon: <PlugInIcon />,
        name: "Authentication",
        subItems: [
            // SOLO MANTENEMOS SIGN IN
            { name: "Sign In", path: "/signin", pro: false },
        ],
    },
    {
        icon: <TableIcon />, 
        name: "Dashboard Admin",
        subItems: [
            { name: "Users", path: "/security-tests" }, 
        ],
    },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  const authResult = useAuth() as any || { user: null, loading: true };
  const { user, loading } = authResult;

  const typedUser: UserType | null = user as UserType | null;
  const typedLoading: boolean = loading as boolean;

  // Menú principal - visible para todos los usuarios
  const navItems: NavItem[] = [
    {
      icon: <HomeIcon />,
      name: "Inicio",
      path: "/",
    },
    {
      icon: <DocumentIcon />,
      name: "Comprobantes",
      subItems: [
        { name: "Ver todos", path: "/" },
        { name: "Buscar", path: "/" },
      ],
    },
    {
      icon: <UsersIcon />,
      name: "Administración",
      subItems: [
        { name: "Usuarios", path: "/users" },
        { name: "Asignar Empresas", path: "/companies/assign" },
        { name: "Roles y Permisos", path: "/admin-permissions" },
      ],
    },
    {
      icon: <SettingsIcon />,
      name: "Configuración",
      subItems: [
        { name: "Mi Perfil", path: "/profile" },
        { name: "Preferencias", path: "/settings" },
      ],
    },
  ];

  // Lógica de redirección
  useEffect(() => {
    if (typedLoading) return;

    const isSignInRoute = pathname === "/signin";

    if (!typedUser && !isSignInRoute) {
      router.replace("/signin");
      return;
    }

    if (typedUser && isSignInRoute) {
      router.replace("/");
      return;
    }
  }, [typedLoading, typedUser, pathname, router]);

  // Estado del acordeón
  const [openSubmenu, setOpenSubmenu] = useState<{ index: number } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    let matched = false;
    navItems.forEach((nav, idx) => {
      if (nav.subItems) {
        nav.subItems.forEach((sub) => {
          if (isActive(sub.path)) {
            setOpenSubmenu({ index: idx });
            matched = true;
          }
        });
      } else if (nav.path && isActive(nav.path)) {
        matched = true;
      }
    });
    if (!matched) setOpenSubmenu(null);
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const idx = openSubmenu.index;
      const el = subMenuRefs.current[idx];
      if (el) {
        setSubMenuHeight((prev) => ({ ...prev, [idx]: el.scrollHeight ?? 0 }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev && prev.index === index ? null : { index }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/signin");
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transition-all duration-300 ease-in-out flex flex-col ${
        isExpanded || isHovered || isMobileOpen ? "w-64" : "w-20"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo en sidebar */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 dark:text-white">GRecibos</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Garnier y Garnier</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="mb-2">
          <span className={`text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 ${
            !isExpanded && !isHovered && !isMobileOpen ? "hidden" : "block px-3"
          }`}>
            Menú
          </span>
        </div>

        <ul className="space-y-1">
          {navItems.map((nav, idx) => (
            <li key={nav.name}>
              {/* Si tiene path directo, renderiza como Link */}
              {nav.path && !nav.subItems ? (
                <Link
                  href={nav.path}
                  className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive(nav.path)
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className={`flex-shrink-0 ${
                    isActive(nav.path) ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="ml-3 flex-1 text-left">{nav.name}</span>
                  )}
                </Link>
              ) : (
                /* Si tiene subItems, renderiza como botón expandible */
                <>
                  <button
                    onClick={() => handleSubmenuToggle(idx)}
                    className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      openSubmenu?.index === idx
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className={`flex-shrink-0 ${
                      openSubmenu?.index === idx ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <>
                        <span className="ml-3 flex-1 text-left">{nav.name}</span>
                        {nav.subItems && (
                          <ChevronDownIcon
                            className={`w-4 h-4 transition-transform ${
                              openSubmenu?.index === idx ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </>
                    )}
                  </button>

                  {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                    <div
                      ref={(el) => { if (el) subMenuRefs.current[idx] = el; }}
                      style={{
                        maxHeight: openSubmenu?.index === idx ? `${subMenuHeight[idx] || 0}px` : "0",
                      }}
                      className="overflow-hidden transition-all duration-300"
                    >
                      <ul className="mt-1 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 space-y-1">
                        {nav.subItems.map((sub) => (
                          <li key={sub.name}>
                            <Link
                              href={sub.path}
                              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                                isActive(sub.path)
                                  ? "bg-blue-100 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-400"
                                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                              }`}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer del sidebar */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogoutIcon />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="ml-3">Cerrar sesión</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
