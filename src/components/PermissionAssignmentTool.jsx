import React, { useState, useEffect, useCallback } from 'react';
import { User, Building2, Save, X, RefreshCw, AlertTriangle } from 'lucide-react';

// --- DEFINICIÓN DE TIPOS (Ajustado a JS/JSX) ---
/* // Define la estructura esperada de un usuario
type UserItem = {
    id: number,
    name: string,
    email: string,
};

// Define la estructura esperada de una empresa
type CompanyItem = {
    id: number,
    name: string,
};
*/

// --- CONSTANTES DE LA API ---
// Nota: En una app real, estas URL base estarían en variables de entorno.
const API_BASE_URL = '/api/admin'; // Asumiendo que las rutas están bajo /api/admin

// ID de Rol Fijo (Reemplaza 1 con el ID del rol que usarás para permisos básicos de usuario)
// Ejemplo: Si el rol 'User' tiene ID 3, usa 3.
const DEFAULT_ROLE_ID = 1; 

const PermissionAssignmentTool = () => {
    // --- ESTADO ---
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [assignedCompanyIds, setAssignedCompanyIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [isSaving, setIsSaving] = useState(false);

    // --- FUNCIONES DE FETCHING ---

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/users-for-assignment`);
            const data = await response.json();
            if (data.ok) {
                setUsers(data.users);
            } else {
                setStatusMessage({ type: 'error', text: 'Error al cargar usuarios.' });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setStatusMessage({ type: 'error', text: 'No se pudo conectar con el servidor para obtener usuarios.' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchCompanies = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/companies`);
            const data = await response.json();
            if (data.ok) {
                setCompanies(data.companies);
            } else {
                setStatusMessage({ type: 'error', text: 'Error al cargar empresas.' });
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    }, []);

    const fetchUserPermissions = useCallback(async (userId) => {
        setIsLoading(true);
        setAssignedCompanyIds(new Set()); // Limpiar antes de cargar
        try {
            const response = await fetch(`${API_BASE_URL}/permissions/${userId}`);
            const data = await response.json();
            if (data.ok) {
                // Convierte el array de IDs a un Set para una búsqueda rápida
                setAssignedCompanyIds(new Set(data.assignedCompanyIds));
            } else {
                setStatusMessage({ type: 'error', text: data.msg || 'Error al cargar permisos.' });
            }
        } catch (error) {
            console.error('Error fetching user permissions:', error);
            setStatusMessage({ type: 'error', text: 'Error de red al obtener permisos.' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    // --- EFECTOS INICIALES ---
    useEffect(() => {
        fetchUsers();
        fetchCompanies();
    }, [fetchUsers, fetchCompanies]);

    // --- MANEJADORES DE EVENTOS ---

    const handleUserSelect = (userId) => {
        setSelectedUserId(userId);
        fetchUserPermissions(userId);
        setStatusMessage({ type: '', text: '' });
    };

    const handleCompanyToggle = (companyId) => {
        const companyIdNumber = parseInt(companyId);
        setAssignedCompanyIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(companyIdNumber)) {
                newSet.delete(companyIdNumber);
            } else {
                newSet.add(companyIdNumber);
            }
            return newSet;
        });
    };

    const handleSavePermissions = async () => {
        if (!selectedUserId) {
            setStatusMessage({ type: 'warning', text: 'Debes seleccionar un usuario primero.' });
            return;
        }

        setIsSaving(true);
        setStatusMessage({ type: 'loading', text: 'Guardando permisos...' });

        // Convierte el Set de IDs a un array para enviarlo a la API
        const companyIdsArray = Array.from(assignedCompanyIds);

        try {
            const response = await fetch(`${API_BASE_URL}/assign-companies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    userId: selectedUserId, 
                    companyIds: companyIdsArray,
                    defaultRoleId: DEFAULT_ROLE_ID // Usamos el ID de rol fijo
                }),
            });

            const data = await response.json();

            if (data.ok) {
                setStatusMessage({ type: 'success', text: data.msg });
            } else {
                setStatusMessage({ type: 'error', text: data.msg || 'Error desconocido al guardar.' });
            }
        } catch (error) {
            console.error('Error saving permissions:', error);
            setStatusMessage({ type: 'error', text: 'Error de red al guardar los permisos.' });
        } finally {
            setIsSaving(false);
        }
    };

    // --- RENDERING AUXILIAR ---

    const getStatusStyles = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'error':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'warning':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'loading':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            default:
                return 'hidden';
        }
    };

    const selectedUser = users.find(u => u.id === selectedUserId);

    // --- ESTRUCTURA PRINCIPAL DEL COMPONENTE ---
    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
            <script src="https://cdn.tailwindcss.com"></script>
            <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 border-b-4 border-indigo-200 pb-2">
                RBAC: Asignación de Permisos (Empresas)
            </h1>
            <p className="text-gray-600 mb-8">
                Panel de control para asignar acceso a empresas a usuarios específicos. 
                Se usa la tabla de unión **UserCompany** de Prisma. (Role ID fijo: {DEFAULT_ROLE_ID})
            </p>

            {/* Mensaje de Estado */}
            <div className={`p-3 rounded-lg border my-4 transition-all duration-300 ${getStatusStyles(statusMessage.type)}`}>
                {statusMessage.text && (
                    <div className="flex items-center">
                        {statusMessage.type === 'error' && <X className="w-5 h-5 mr-2" />}
                        {statusMessage.type === 'warning' && <AlertTriangle className="w-5 h-5 mr-2" />}
                        {statusMessage.type === 'loading' && <RefreshCw className="w-5 h-5 mr-2 animate-spin" />}
                        {statusMessage.type === 'success' && <Save className="w-5 h-5 mr-2" />}
                        <p className="font-medium">{statusMessage.text}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COLUMNA 1: Selección de Usuario */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-full">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4 border-b pb-2">
                        <User className="w-5 h-5 mr-2 text-indigo-500" />
                        1. Seleccionar Usuario
                    </h2>
                    
                    {isLoading && users.length === 0 ? (
                        <div className="flex justify-center items-center h-20 text-indigo-500">
                            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                            Cargando Usuarios...
                        </div>
                    ) : (
                        <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {users.map((user) => (
                                <li 
                                    key={user.id} 
                                    className={`p-3 rounded-lg cursor-pointer transition duration-150 ease-in-out border 
                                        ${selectedUserId === user.id ? 'bg-indigo-600 text-white shadow-md border-indigo-700' : 'bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300'}`
                                    }
                                    onClick={() => handleUserSelect(user.id)}
                                >
                                    <div className={`font-semibold ${selectedUserId === user.id ? 'text-white' : 'text-gray-800'}`}>{user.name || 'Sin Nombre'}</div>
                                    <div className={`text-sm ${selectedUserId === user.id ? 'text-indigo-200' : 'text-gray-500'}`}>{user.email} (ID: {user.id})</div>
                                </li>
                            ))}
                            {users.length === 0 && <p className="text-gray-500 italic">No hay usuarios disponibles.</p>}
                        </ul>
                    )}
                </div>

                {/* COLUMNA 2 & 3: Asignación de Empresas */}
                <div className={`lg:col-span-2 bg-white p-6 rounded-xl shadow-lg ${!selectedUserId ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4 border-b pb-2">
                        <Building2 className="w-5 h-5 mr-2 text-indigo-500" />
                        2. Asignar Empresas a: 
                        <span className="ml-2 font-bold text-indigo-600">
                            {selectedUser ? `${selectedUser.name || selectedUser.email}` : 'N/A'}
                        </span>
                    </h2>

                    <div className="max-h-[500px] overflow-y-auto pr-2 mb-6">
                        {isLoading && selectedUserId ? (
                            <div className="flex justify-center items-center h-20 text-indigo-500">
                                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                                Cargando permisos actuales...
                            </div>
                        ) : (
                            companies.map((company) => {
                                const isAssigned = assignedCompanyIds.has(company.id);
                                return (
                                    <div 
                                        key={company.id}
                                        className={`flex items-center justify-between p-3 my-2 rounded-lg transition duration-150 ease-in-out cursor-pointer border 
                                            ${isAssigned ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-100'}`}
                                        onClick={() => handleCompanyToggle(company.id)}
                                    >
                                        <div className="font-medium text-gray-800">{company.name}</div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={isAssigned}
                                                onChange={() => handleCompanyToggle(company.id)}
                                                className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                                            />
                                            <span className={`ml-2 text-sm font-semibold ${isAssigned ? 'text-blue-600' : 'text-gray-500'}`}>
                                                {isAssigned ? 'ASIGNADA' : 'NO ASIGNADA'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        {companies.length === 0 && !isLoading && <p className="text-gray-500 italic">No hay empresas disponibles.</p>}
                    </div>

                    {/* Botón de Guardar */}
                    <button
                        onClick={handleSavePermissions}
                        disabled={!selectedUserId || isSaving}
                        className={`w-full py-3 px-4 rounded-xl text-white font-bold transition duration-300 ease-in-out shadow-md
                            ${selectedUserId && !isSaving 
                                ? 'bg-green-600 hover:bg-green-700 active:bg-green-800' 
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isSaving ? (
                            <div className="flex items-center justify-center">
                                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                Guardando...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <Save className="w-5 h-5 mr-2" />
                                Guardar Permisos ({selectedUser ? 'a ' + selectedUser.name : 'Seleccione Usuario'})
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PermissionAssignmentTool;