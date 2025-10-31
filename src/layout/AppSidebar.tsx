"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { GridIcon, TableIcon, ChevronDownIcon, HorizontaLDots, PlugInIcon } from "../icons/index";

// 1. IMPORTAR EL HOOK DE AUTENTICACIÓN
import { useAuth } from "@/hooks/useAuth"; // **Asegúrate que esta ruta es correcta**

// Define la estructura de los elementos del menú
type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const defaultNavItems: NavItem[] = [
    {
        icon: <GridIcon />,
        name: "Dashboard",
        subItems: [{ name: "Ecommerce", path: "/", pro: false }],
    },
    {
        icon: <PlugInIcon />,
        name: "Authentication",
        subItems: [
            { name: "Sign In", path: "/signin", pro: false },
            { name: "Sign Up", path: "/signup", pro: false },
        ],
    },
];

const AppSidebar: React.FC = () => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const pathname = usePathname();

    // 2. OBTENER EL CONTEXTO DEL USUARIO (Corregido para manejar 'null')
    // =========================================================================
    // **CAMBIO CRÍTICO**: Obtenemos el contexto completo primero, que puede ser null.
   const authContext = useAuth() as any; 
    const user = authContext?.user;
    const loading = authContext?.loading; 
    
    // Dejamos esta variable solo para referencia, pero no la usaremos en el IF
    const esAdministrador = user?.roleId === 3; 
    
    // 3. GENERAR navItems (TEMPORALMENTE SIN CONDICIÓN)
    const navItems = React.useMemo(() => {
        let items: NavItem[] = [...defaultNavItems]; // Empezar con los elementos por defecto

        // 🚨 CAMBIO TEMPORAL: LO AGREGAMOS SIEMPRE PARA VER SI EL COMPONENTE LO RENDERIZA 🚨
        items.push({
            icon: <TableIcon />, 
            name: "Security",
            subItems: [
                { name: "Pruebas de Seguridad", path: "/security-tests" }, 
            ],
        });
        
        return items;
    }, [esAdministrador]);// Se recalcula cuando el rol del usuario cambia

    // Resto del código de estado y efectos (se deja igual)
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
    }, [pathname, isActive, navItems]); // Añadir navItems a las dependencias

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

    // Si está cargando, podemos mostrar un esqueleto o simplemente esperar que el provider lo maneje
    if (loading) {
        return <aside className="fixed top-[60px] left-0 mt-0 px-5 bg-white dark:bg-gray-900 w-[90px] h-screen z-50 border-r border-gray-200"><div className="py-6">Cargando...</div></aside>;
    }


    // El resto del JSX de renderizado
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
            <div className="flex flex-col overflow-y-auto no-scrollbar duration-300 ease-linear">
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
                    <ul className="flex flex-col gap-4">
                        {/* Se recorren los navItems generados condicionalmente */}
                        {navItems.map((nav, idx) => ( 
                            <li key={nav.name}>
                                {/* ... Resto de tu lógica para renderizar subItems y botones ... */}
                                {nav.subItems ? (
                                    <button
                                        onClick={() => handleSubmenuToggle(idx)}
                                        className={`menu-item group cursor-pointer ${
                                            openSubmenu?.index === idx
                                                ? "menu-item-active"
                                                : "menu-item-inactive"
                                        } ${
                                            !isExpanded && !isHovered
                                                ? "lg:justify-center"
                                                : "lg:justify-start"
                                        }`}
                                    >
                                        <span
                                            className={`${
                                                openSubmenu?.index === idx
                                                    ? "menu-item-icon-active"
                                                    : "menu-item-icon-inactive"
                                            }`}
                                        >
                                            {nav.icon}
                                        </span>
                                        {(isExpanded || isHovered || isMobileOpen) && (
                                            <span className="menu-item-text">{nav.name}</span>
                                        )}
                                        {(isExpanded || isHovered || isMobileOpen) && (
                                            <ChevronDownIcon
                                                className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                                                    openSubmenu?.index === idx ? "rotate-180 text-brand-500" : ""
                                                }`}
                                            />
                                        )}
                                    </button>
                                ) : (
                                    nav.path && (
                                        <Link
                                            href={nav.path}
                                            className={`menu-item group ${
                                                isActive(nav.path)
                                                    ? "menu-item-active"
                                                    : "menu-item-inactive"
                                            }`}
                                        >
                                            <span
                                                className={`${
                                                    isActive(nav.path)
                                                        ? "menu-item-icon-active"
                                                        : "menu-item-icon-inactive"
                                                }`}
                                            >
                                                {nav.icon}
                                            </span>
                                            {(isExpanded || isHovered || isMobileOpen) && (
                                                <span className="menu-item-text">{nav.name}</span>
                                            )}
                                        </Link>
                                    )
                                )}
                                {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                                    <div
                                        ref={(el) => {
                                            subMenuRefs.current[idx] = el;
                                        }}
                                        className="overflow-hidden transition-all duration-300"
                                        style={{
                                            height:
                                                openSubmenu?.index === idx
                                                    ? `${subMenuHeight[idx]}px`
                                                    : "0px",
                                        }}
                                    >
                                        <ul className="mt-2 space-y-1 ml-9">
                                            {nav.subItems.map((sub) => (
                                                <li key={sub.name}>
                                                    <Link
                                                        href={sub.path}
                                                        className={`menu-dropdown-item ${
                                                            isActive(sub.path)
                                                                ? "menu-dropdown-item-active"
                                                                : "menu-dropdown-item-inactive"
                                                        }`}
                                                    >
                                                        {sub.name}
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