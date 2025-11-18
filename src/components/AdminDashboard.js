"use client";

import React, { useState } from 'react';
import axios from 'axios';
// CORRECCIÓN: Usando un path simplificado. Si esto falla, por favor ajusta a la ruta real de tu proyecto.
// Asumiendo que 'components' y 'context' están en el mismo nivel (p. ej., en 'src/')
import { useAuth } from '../context/AuthContext'; 
import AdminPermissionsManager from './AdminPermissionsManager'; // <-- CORRECCIÓN: La ruta es relativa al mismo directorio

const API_URL = 'http://localhost:3000'; // Asegúrate que coincida con tu backend

export const AdminDashboard = () => {
    // Es mejor extraer el usuario del hook de autenticación si lo tienes disponible
    // const { token, isAuthenticated, logout, user } = useAuth();
    const { token, isAuthenticated, logout } = useAuth();
    
    // Asumiendo que useAuth proporciona el objeto 'user'
    const authContext = useAuth(); 
    const userEmail = authContext?.user?.email || 'N/A';

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
        <div className="p-6 border rounded shadow-lg bg-gray-50 max-w-6xl mx-auto">
            <h2 className="text-2xl font-extrabold mb-4 text-blue-800 border-b pb-2">Panel de Control de Administración</h2>
            <p className="mb-4 text-sm text-gray-600">
                Token Activo: **{token ? 'Sí' : 'No'}** | Email de sesión: {userEmail}
            </p>
            <button onClick={logout} className='bg-red-500 text-white px-4 py-2 rounded mb-6 hover:bg-red-600 transition duration-150'>
                Cerrar Sesión
            </button>

            {/* SECCIÓN DE PRUEBAS DE SEGURIDAD EXISTENTE */}
            <div className="mb-8 p-4 bg-white border rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4 text-indigo-700">Pruebas de Seguridad (API Endpoints)</h3>

                {/* PRUEBA IS ADMIN */}
                <h4 className="text-lg font-semibold mt-4 border-b pb-1 text-gray-700">1. Prueba `isAdmin` (Acceso Global)</h4>
                <p className="text-xs italic mb-2 text-gray-500">Debe dar **200 OK** solo si el usuario tiene Role ID 1.</p>
                <button 
                    onClick={testAdminRoute} 
                    className="bg-blue-600 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700 transition duration-150 shadow-md"
                >
                    Probar /api/admin/roles
                </button>
                <p className="mt-2 p-3 bg-gray-100 rounded break-words font-mono text-sm border">Resultado: {adminMessage}</p>

                {/* PRUEBA RBAC POR COMPAÑÍA */}
                <h4 className="text-lg font-semibold mt-6 border-b pb-1 text-gray-700">2. Prueba `permissionMiddleware` (Acceso por Recurso/Compañía)</h4>
                <p className="text-xs italic mb-2 text-gray-500">Prueba si el usuario puede leer Compañía 1 vs. una inexistente (999).</p>
                
                <div className='flex gap-4 mt-3'>
                    <div className='flex-1'>
                        <p className="font-semibold mb-2 text-sm">Compañía ID 1:</p>
                        <button 
                            onClick={() => testRbacRoute(1, 'read_company')} 
                            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-150 shadow-md"
                        >
                            Probar GET /company/1
                        </button>
                    </div>
                    <div className='flex-1'>
                        <p className="font-semibold mb-2 text-sm">Compañía ID 999:</p>
                        <button 
                            onClick={() => testRbacRoute(999, 'read_company')} 
                            className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition duration-150 shadow-md"
                        >
                            Probar GET /company/999
                        </button>
                    </div>
                </div>

                <p className="mt-4 p-3 bg-gray-100 rounded break-words font-mono text-sm border">Resultado RBAC: {rbacMessage}</p>
            </div>


            {/* SECCIÓN DE GESTIÓN DE PERMISOS */}
            <div className="mt-10 p-4 bg-white border rounded-lg shadow-xl">
                <h3 className="text-xl font-bold mb-4 text-pink-700 border-b pb-2">3. Gestión de Permisos (RBAC Manager)</h3>
                <AdminPermissionsManager authenticatedAxios={authenticatedAxios} />
            </div>

        </div>
    );
};