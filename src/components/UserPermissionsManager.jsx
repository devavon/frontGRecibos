import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios'; // ¡Asegúrate de tener Axios instalado!

// === CONFIGURACIÓN DE ENDPOINTS ===
// Usamos la URL base para el administrador
const BASE_URL = 'http://localhost:3000/api/admin';

// --- COMPONENTE PRINCIPAL ---

export default function UserPermissionsManager() {
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(''); 
    const [userPermissions, setUserPermissions] = useState(new Set()); 
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(''); 

    // --- LÓGICA DE DATOS: Traer datos de las APIs usando Axios ---

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. OBTENER USUARIOS
                const [userResponse, companyResponse] = await Promise.all([
                    axios.get(`${BASE_URL}/users`),
                    // 2. OBTENER EMPRESAS (Usamos 'companies' en plural por convención)
                    axios.get(`${BASE_URL}/companies`)
                ]);

                // Asume que los datos están en response.data
                setUsers(userResponse.data);
                setCompanies(companyResponse.data);

            } catch (error) {
                console.error('Error al cargar datos iniciales con Axios:', error);
                const errorMessage = error.response?.data?.message || error.message;
                setMessage(`❌ Error de conexión: ${errorMessage}. Verifica que tus APIs estén funcionando.`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // 2. Manejar el cambio en el select de usuario
    const handleUserSelect = (e) => {
        // Convierte a número si tus IDs de usuario son numéricos
        const userId = parseInt(e.target.value, 10); 
        setSelectedUserId(userId);
        
        // Cargar los permisos del usuario seleccionado
        const user = users.find(u => u.id === userId);
        if (user && user.permissions) {
            // CRUCIAL: user.permissions debe ser un array de IDs de empresas
            setUserPermissions(new Set(user.permissions));
        } else {
            setUserPermissions(new Set());
        }
        setMessage('');
    };

    // 3. Manejar el cambio de un permiso (checkbox)
    const handleTogglePermission = (companyId) => {
        setUserPermissions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(companyId)) {
                newSet.delete(companyId);
            } else {
                newSet.add(companyId);
            }
            return newSet;
        });
        setMessage('');
    };
    
    // Usuario actualmente seleccionado
    const selectedUser = useMemo(() => 
        users.find(u => u.id === selectedUserId), 
        [users, selectedUserId]
    );

    // 4. Guardar los permisos en el backend (MySQL)
    const handleSavePermissions = async () => {
        if (!selectedUserId) {
            setMessage('Debe seleccionar un usuario para guardar.');
            return;
        }

        setIsSaving(true);
        setMessage('Guardando permisos...');
        
        try {
            const permissionsArray = Array.from(userPermissions);
            
            // 🚨 REAL: Llamada a la API de Next.js/MySQL para guardar los permisos
            // Endpoint: /api/admin/permissions/update
            const response = await axios.post(`${BASE_URL}/permissions/update`, {
                userId: selectedUserId,
                permissions: permissionsArray,
            });
            
            // Axios usa status 2xx para 'ok', no necesita .ok
            if (response.status >= 200 && response.status < 300) {
                setMessage('✅ Permisos actualizados exitosamente en MySQL.');
                
                // Actualizar la lista local de usuarios con los nuevos permisos
                setUsers(prevUsers => prevUsers.map(u => 
                    u.id === selectedUserId 
                        ? { ...u, permissions: permissionsArray } 
                        : u
                ));
            }

        } catch (error) {
            console.error('Error de red/servidor al actualizar permisos:', error);
            const errorMessage = error.response?.data?.message || 'Error de conexión con el servidor.';
            setMessage(`❌ Error al guardar: ${errorMessage}`);
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(''), 5000); 
        }
    };
    
    // --- RENDERIZADO ---
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh] text-lg text-gray-600">
                Cargando datos de usuarios y empresas con Axios...
            </div>
        );
    }
    
    return (
        <div className="p-6 bg-gray-50 min-h-[80vh] rounded-xl shadow-2xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-2">
                Gestor de Permisos de Empresa (Dashboard Admin)
            </h1>
            
            {/* Sección de Selección de Usuario (Dropdown) */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-blue-100">
                <label htmlFor="user-select" className="block text-lg font-medium text-blue-700 mb-2">
                    Seleccionar Usuario
                </label>
                <select
                    id="user-select"
                    value={selectedUserId || ''}
                    onChange={handleUserSelect}
                    className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150 bg-white text-gray-700 appearance-none cursor-pointer"
                >
                    <option value="" disabled>-- Selecciona un usuario registrado --</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                        </option>
                    ))}
                </select>
                {users.length === 0 && (
                    <p className="text-red-500 mt-2">No se encontraron usuarios en la API.</p>
                )}
            </div>

            {/* Sección de Asignación de Permisos */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100 min-h-[50vh]">
                <h2 className="text-xl font-semibold mb-4 text-green-700 border-b pb-2">
                    {selectedUser ? `Asignar Empresas a: ${selectedUser.name}` : 'Empresas Disponibles (Selecciona un usuario arriba)'}
                </h2>

                {!selectedUser ? (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-lg">Una vez que selecciones un usuario, aparecerán aquí todas las empresas para que puedas marcar sus permisos.</p>
                        {companies.length === 0 && <p className="text-sm text-red-500 mt-4">Advertencia: No se encontraron empresas en la API.</p>}
                    </div>
                ) : (
                    <>
                        {/* Mensaje de Estado */}
                        {message && (
                            <div className={`p-3 mb-4 rounded-lg text-sm font-medium ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {message}
                            </div>
                        )}

                        {/* Lista de Permisos */}
                        {companies.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto pr-2">
                                {companies.map((company) => (
                                    <div key={company.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition duration-150 border border-gray-200">
                                        <input
                                            type="checkbox"
                                            id={`company-${company.id}`}
                                            checked={userPermissions.has(company.id)}
                                            onChange={() => handleTogglePermission(company.id)}
                                            className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                        />
                                        <label htmlFor={`company-${company.id}`} className="flex flex-col flex-1 cursor-pointer">
                                            <span className="text-base font-medium text-gray-800">{company.name}</span>
                                            {/* Si tu objeto de empresa tiene una propiedad 'ruc', la mostramos */}
                                            {company.ruc && <span className="text-xs text-gray-500">RUC: {company.ruc} (ID: {company.id})</span>}
                                            {!company.ruc && <span className="text-xs text-gray-500">ID: {company.id}</span>}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-red-500">
                                No hay empresas disponibles para asignar.
                            </div>
                        )}
                        

                        {/* Botón de Guardar */}
                        {companies.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <button
                                    onClick={handleSavePermissions}
                                    disabled={isSaving}
                                    className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-700 transition duration-150 disabled:bg-green-300 disabled:cursor-not-allowed transform hover:scale-[1.01]"
                                >
                                    {isSaving ? 'Guardando...' : 'Guardar Permisos en MySQL'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}