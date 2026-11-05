"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const routeNames: Record<string, string> = {
  users: "Usuarios",
  permissions: "Permisos",
  companies: "Empresas",
  assign: "Asignación",
  "change-password": "Cambiar contraseña",
};

// Barra de migas bajo el topbar (patrón Gpeople). No se muestra en Inicio.
export default function Breadcrumbs() {
  const pathname = usePathname() || "/";
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) return null;

  return (
    <div
      className="h-9 flex items-center px-4 border-b text-[12px] shrink-0"
      style={{
        backgroundColor: "white",
        borderColor: "var(--gp-border)",
        color: "var(--gp-text-secondary)",
      }}
    >
      <Link href="/" className="hover:text-[var(--gp-green-text)] transition">
        Inicio
      </Link>
      {parts.map((part, i) => {
        const path = "/" + parts.slice(0, i + 1).join("/");
        const name = routeNames[part] || part;
        const isLast = i === parts.length - 1;
        return (
          <span key={path} className="flex items-center">
            <ChevronRight size={14} className="mx-1 text-gray-300" />
            {isLast ? (
              <span style={{ color: "var(--gp-text-primary)", fontWeight: 500 }}>{name}</span>
            ) : (
              <Link href={path} className="hover:text-[var(--gp-green-text)] transition">
                {name}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}
