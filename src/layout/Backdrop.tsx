import { useSidebar } from "@/context/SidebarContext";
import React from "react";

// Overlay del menú en móvil (igual que Gpeople)
const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-30 lg:hidden"
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
