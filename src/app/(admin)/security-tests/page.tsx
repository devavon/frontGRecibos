'use client'; 
// CAMBIO CLAVE: Usamos rutas relativas (subir tres niveles: de security-tests, a admin, a app, a src)
// Verifica que estas rutas relativas sean correctas en tu estructura de carpetas.

import { AdminDashboard } from "../../../components/AdminDashboard"; 
import { useAuth } from "../../../hooks/useAuth"; 
import React from "react";

const SecurityTestsPage = () => {
    // 1. OBTENEMOS EL CONTEXTO Y LAS VARIABLES DE FORMA SEGURA
    const authContext = useAuth() as any; 
    const user = authContext?.user;       
    const loading = authContext?.loading; 

    // Si está cargando, mostramos un mensaje de espera
    if (loading) {
        return <div className="p-6">Cargando datos de usuario...</div>;
    }

    // 2. LÓGICA DE PROTECCIÓN (Bloqueo si NO es Admin)
    // El rol de Administrador es 3
    if (user?.roleId !== 3) { 
        return (
            <div className="p-6 text-red-500">
                ❌ **Acceso Denegado.** Esta página es solo para Administradores Globales.
            </div>
        );
    }

    // 3. Si es Administrador (user.roleId === 3), renderizamos el Dashboard
    return <AdminDashboard />;
};

export default SecurityTestsPage;