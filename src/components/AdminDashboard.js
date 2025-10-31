"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // ⚠️ Ajusta la ruta de '../context/AuthContext'

const API_URL = 'http://localhost:3000'; // Asegúrate que coincida con tu backend

export const AdminDashboard = () => {
    const { token, isAuthenticated, logout } = useAuth();
    const [adminMessage, setAdminMessage] = useState('Esperando prueba de Admin...');
    const [rbacMessage, setRbacMessage] = useState('Esperando prueba de RBAC...');

    if (!isAuthenticated) {
        return <div className="p-4 border rounded shadow-lg bg-red-100 text-red-700">❌ Por favor, inicia sesión para realizar las pruebas.</div>;
    }

    // --- Configuración de Axios para incluir el Token ---
    const authenticatedAxios = axios.create({
        baseURL: API_URL,
        headers: {
            // El token se envía en el encabezado Authorization
            'Authorization': `Bearer ${token}` 
        }
    });

    // =========================================================
    // 🧪 PRUEBA 1: Ruta de Administración (Protegida por isAdmin)
    // =========================================================
    const testAdminRoute = async () => {
        setAdminMessage('Probando /api/admin/roles...');
        try {
            const response = await authenticatedAxios.get('/api/admin/roles');
            // Si el usuario es ADMIN (Role ID = 1), verá los datos
            setAdminMessage(`✅ Éxito (200 OK): El usuario ES Administrador. Roles obtenidos: ${response.data.length} roles.`);
        } catch (error) {
            // Si el usuario NO es ADMIN, recibirá 403 Forbidden
            const status = error.response?.status;
            const msg = error.response?.data?.error || "Error de conexión";
            setAdminMessage(`❌ Fallo (${status}): Acceso denegado por isAdmin. Mensaje: ${msg}`);
        }
    };

    // =========================================================
    // 🧪 PRUEBA 2: Ruta de Compañía (Protegida por permissionMiddleware)
    // =========================================================
    const testRbacRoute = async (companyId, requiredPermission) => {
        setRbacMessage(`Probando GET /company/${companyId} (Permiso: ${requiredPermission})...`);
        try {
            const response = await authenticatedAxios.get(`/company/${companyId}`);
            // Si el usuario tiene el permiso 'read_company' para ese ID, verá los datos
            setRbacMessage(`✅ Éxito (200 OK): Acceso concedido a la compañía ${companyId}. Nombre: ${response.data.name}`);
        } catch (error) {
            // Si el usuario no tiene la asignación o el permiso, recibirá 403 Forbidden
            const status = error.response?.status;
            const msg = error.response?.data?.error || "Error de conexión";
            setRbacMessage(`❌ Fallo (${status}): Acceso denegado por RBAC. Mensaje: ${msg}`);
        }
    };

    return (
        <div className="p-6 border rounded shadow-lg bg-gray-50 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Dashboard de Pruebas de Seguridad (RBAC)</h2>
            <p className="mb-4 text-sm">Token Activo: **{token ? 'Sí' : 'No'}** | Email de sesión: {isAuthenticated ? useAuth().user.email : 'N/A'}</p>
            <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded mb-6 hover:bg-red-600">
                Cerrar Sesión
            </button>

            {/* PRUEBA IS ADMIN */}
            <h3 className="text-lg font-semibold mt-4 border-b pb-2">1. Prueba `isAdmin` (Acceso a Configuración Global)</h3>
            <p className="text-sm italic mb-2 text-gray-600">Debe dar **200 OK** solo si el usuario tiene Role ID 1.</p>
            <button 
                onClick={testAdminRoute} 
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
            >
                Probar /api/admin/roles
            </button>
            <p className="mt-2 p-3 bg-gray-200 rounded break-words font-mono text-sm">Resultado: {adminMessage}</p>

            {/* PRUEBA RBAC POR COMPAÑÍA */}
            <h3 className="text-lg font-semibold mt-6 border-b pb-2">2. Prueba `permissionMiddleware` (Acceso por Recurso/Compañía)</h3>
            <p className="text-sm italic mb-2 text-gray-600">Debe dar **200 OK** solo si el usuario tiene el permiso `read_company` para el ID solicitado.</p>
            
            <p className="font-semibold mt-4">Prueba con Compañía ID 1 (Debería dar OK si tiene el permiso asignado a la Cía 1):</p>
            <button 
                onClick={() => testRbacRoute(1, 'read_company')} 
                className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
            >
                Probar GET /company/1
            </button>
            
            <p className="font-semibold mt-4">Prueba con Compañía ID 999 (Debería dar 403, no está asignado):</p>
            <button 
                onClick={() => testRbacRoute(999, 'read_company')} 
                className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 hover:bg-yellow-600"
            >
                Probar GET /company/999
            </button>

            <p className="mt-2 p-3 bg-gray-200 rounded break-words font-mono text-sm">Resultado RBAC: {rbacMessage}</p>
        </div>
    );
};