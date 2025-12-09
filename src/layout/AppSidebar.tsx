"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Aseguramos useRouter
import { useSidebar } from "../context/SidebarContext";
import { GridIcon, TableIcon, ChevronDownIcon, HorizontaLDots, PlugInIcon } from "../icons/index";
import { useAuth } from "@/hooks/useAuth";

// Definición de tipos para el usuario
type UserType = {
    id: number;
    email: string;
    roleId: number; 
    name: string;
};

// Define la estructura de los elementos del menú
type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
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

    // OBTENER EL CONTEXTO DEL USUARIO DE FORMA SEGURA
    const authResult = useAuth() as any || { user: null, loading: true }; 
    const { user, loading } = authResult;

    const typedUser: UserType | null = user as UserType | null;
    const typedLoading: boolean = loading as boolean;

    // Lógica real: mostrar herramientas solo si es rol 1 y está logueado
    const mostrarAdminTools = typedUser && typedUser.roleId === 1; 

    // GENERAR navItems CON LÓGICA CONDICIONAL
    const navItems = React.useMemo(() => {
        let items: NavItem[] = [...defaultNavItems];

        if (mostrarAdminTools) {
             items.push({
                 icon: <PlugInIcon />, 
                 name: "Administration Tools", 
                 subItems: [
                     { name: "Asignar Compañías", path: "/companies/assign" },
                     { name: "Gestión de Roles/Permisos", path: "/admin-permissions" }, 
                 ],
             });
        }

        return items;
    }, [mostrarAdminTools]);

    // ====================================================================
    // LÓGICA DE REDIRECCIÓN (Control de Autenticación)
    // ====================================================================
    useEffect(() => {
        // Detener la lógica mientras el estado de autenticación está cargando/resolviéndose
        if (typedLoading) {
            return;
        }

        const isSignInRoute = pathname === "/signin"; 
        const homePath = "/";
        
        // Caso A: Usuario NO autenticado en una ruta protegida.
        // Redirigir a /signin.
        if (!typedUser && !isSignInRoute) {
            console.log("No autenticado. Redirigiendo a /signin...");
            // Usar replace para prevenir bucles y limpiar el historial
            router.replace("/signin");
            return;
        }

        // Caso B: Usuario SÍ autenticado y está en la página de /signin.
        // Redirigir a la página principal.
        if (typedUser && isSignInRoute) {
            console.log("Autenticado en /signin. Redirigiendo a la página principal (/).");
            // Usar replace para prevenir bucles y limpiar el historial
            router.replace(homePath);
            return;
        }

    }, [typedLoading, typedUser, pathname, router]);


    // CÓDIGO DE MANEJO DE ESTADO DEL SIDEBAR (Acordeón)
    const [openSubmenu, setOpenSubmenu] = useState<{
        index: number;
    } | null>(null);
    const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
    const subMenuRefs = useRef<Record<number, HTMLDivElement | null>>({}); 

    const isActive = useCallback(
        (path: string) => path === pathname,
        [pathname]
    );

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
            }
        });
        if (!matched) {
            setOpenSubmenu(null);
        }
    }, [pathname, isActive, navItems]);

    useEffect(() => {
        if (openSubmenu !== null) {
            const idx = openSubmenu.index;
            const el = subMenuRefs.current[idx];
            if (el) {
                setSubMenuHeight((prev) => ({
                    ...prev,
                    [idx]: el.scrollHeight ?? 0,
                }));
            }
        }
    }, [openSubmenu]);

    const handleSubmenuToggle = (index: number) => {
        setOpenSubmenu((prev) =>
            prev && prev.index === index ? null : { index }
        );
    };
    
    // Clases de utilidad
    const menuItemClass = `
        flex items-center w-full p-3 text-sm font-medium rounded-lg 
        transition-colors duration-200 
    `;
    const activeMenuItemClass = `
        bg-indigo-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400
    `;
    const inactiveMenuItemClass = `
        text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700
    `;
    const iconBaseClass = `
        w-5 h-5 flex-shrink-0 transition-colors duration-200
    `;
    const activeIconClass = `
        text-indigo-600 dark:text-indigo-400
    `;
    const inactiveIconClass = `
        text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400
    `;

    // RETORNA EL SIDEBAR COMPLETO
    return (
        <aside
            className={`fixed top-[60px] left-0 mt-0 px-5 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen z-50 border-r border-gray-200 transition-all duration-300 ease-in-out ${
                isExpanded || isHovered || isMobileOpen
                    ? "w-[290px]"
                    : "w-[90px]"
            } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex flex-col overflow-y-auto no-scrollbar duration-300 ease-in-out">
                <nav className="mb-6">
                    <h2
                        className={`pt-6 mb-4 text-xs uppercase text-gray-400 ${
                            !isExpanded && !isHovered
                                ? "lg:justify-center"
                                : "justify-start"
                        } flex`}
                    >
                        {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
                    </h2>
                    <ul className="flex flex-col gap-1">
                        {navItems.map((nav, idx) => ( 
                            <li key={nav.name}>
                                {/* Enlace principal si no tiene subItems */}
                                {nav.path && !nav.subItems ? (
                                    <Link
                                        href={nav.path}
                                        className={`${menuItemClass} group ${
                                            isActive(nav.path)
                                                ? activeMenuItemClass
                                                : inactiveMenuItemClass
                                        }`}
                                    >
                                        <span
                                            className={`${iconBaseClass} ${
                                                isActive(nav.path)
                                                    ? activeIconClass
                                                    : inactiveIconClass
                                            }`}
                                        >
                                            {nav.icon}
                                        </span>
                                        {(isExpanded || isHovered || isMobileOpen) && (
                                            <span className="ml-3 truncate">{nav.name}</span>
                                        )}
                                    </Link>
                                ) : (
                                    // Botón para subItems
                                    <button
                                        onClick={() => handleSubmenuToggle(idx)}
                                        className={`${menuItemClass} group cursor-pointer w-full justify-between ${
                                            openSubmenu && openSubmenu.index === idx 
                                                ? activeMenuItemClass
                                                : inactiveMenuItemClass
                                        }`}
                                    >
                                        <div className="flex items-center flex-shrink-0">
                                            <span
                                                className={`${iconBaseClass} ${
                                                    openSubmenu && openSubmenu.index === idx
                                                        ? activeIconClass
                                                        : inactiveIconClass
                                                }`}
                                            >
                                                {nav.icon}
                                            </span>
                                            {(isExpanded || isHovered || isMobileOpen) && (
                                                <span className="ml-3 truncate text-left">{nav.name}</span>
                                            )}
                                        </div>
                                        {/* Flecha de acordeón */}
                                        {(isExpanded || isHovered || isMobileOpen) && nav.subItems && (
                                            <ChevronDownIcon 
                                                className={`w-4 h-4 ml-auto transition-transform duration-200 ${
                                                    openSubmenu && openSubmenu.index === idx ? "rotate-180" : ""
                                                }`}
                                            />
                                        )}
                                    </button>
                                )}
                                
                                {/* Submenú (Acordeón) */}
                                {nav.subItems && (
                                    <div
                                        ref={(el) => {
                                            if (el) subMenuRefs.current[idx] = el;
                                        }}
                                        style={{
                                            maxHeight: openSubmenu && openSubmenu.index === idx
                                                ? `${subMenuHeight[idx] || 0}px` 
                                                : "0",
                                        }}
                                        className="overflow-hidden transition-max-height duration-300 ease-in-out"
                                    >
                                        <ul className="flex flex-col pt-2 pb-1 space-y-1">
                                            {nav.subItems.map((sub) => (
                                                <li key={sub.name} className="ml-5">
                                                    <Link
                                                        href={sub.path}
                                                        className={`flex items-center p-2 text-sm rounded-lg transition-colors duration-200 ${
                                                            isActive(sub.path)
                                                                ? "bg-indigo-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-semibold"
                                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-normal"
                                                        }`}
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-3"></span>
                                                        <span className="truncate">
                                                            {sub.name}
                                                        </span>
                                                        {sub.pro && <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">PRO</span>}
                                                        {sub.new && <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">NEW</span>}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </aside>
    );
};
export default AppSidebar;