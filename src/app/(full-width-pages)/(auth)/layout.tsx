import React from "react";

// Las pantallas de acceso dibujan su propio fondo (AuthShell, estilo Gpeople).
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
