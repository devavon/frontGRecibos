"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Iconos
import { User, Mail, Key, Loader2, AlertTriangle, ArrowDownUp, Building, Pencil, X, Save } from 'lucide-react';

// =========================================================
// 0. CONFIGURACIÓN CENTRALIZADA DE LA API
// =========================================================

// URL BASE: El prefijo de tu API. Se usa: API_BASE_URL + /companies o /users/{id}
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin`; 

// CLAVE DE AUTENTICACIÓN: Usada para simular el token de un Admin
const API_KEY = 'mock-token-admin'; 

/**
 * MOCK de useAuth para forzar el modo Administrador para la demostración.
 */
const useAuth = () => {
    const mockUser = { 
        id: 'auth-admin', 
        email: 'admin@system.com', 
        roleId: 3, // 3 = Admin (Necesario para ver y editar permisos)
        companyId: null, 
        name: 'Super Administrador' 
    };
    
    return { 
        user: mockUser, 
        isAuthenticated: true, 
        token: API_KEY 
    };
};

// =========================================================
// 1. TIPADO DE DATOS
// =========================================================

interface Company {
    id: string;
    name: string;
}

interface UserData {
    id: string;
    name: string;
    email: string;
    companyId: string | null; 
    allowedCompanyIds: string[]; 
    roleId: number; 
    createdAt: string | Date; 
}

// =========================================================
// 2. MOCK DE AXIOS (SIMULACIÓN DE BACKEND Y BASE DE DATOS)
//    - Contiene los datos simulados que ahora se "sirven" desde la API.
// =========================================================

// Base de Datos Simulado de Empresas (Inmutable)
const COMPANIES_DB: Company[] = [
    { id: 'c1', name: 'Alpha Solutions, S.A.' },
    { id: 'c2', name: 'Beta Innovations Group' },
    { id: 'c3', name: 'Gamma Logic Systems' },
    { id: 'c4', name: 'Delta Metrics Corp.' },
    { id: 'c5', name: 'Epsilon Tech' },
    { id: 'c6', name: 'Zeta Consulting' },
];

// Base de Datos Simulado de Usuarios (Mutable para simular persistencia en PUT)
let USERS_DB: UserData[] = [
    { id: 'u1', name: 'Juan Pérez (User)', email: 'juan@c1.com', companyId: 'c1', roleId: 2, allowedCompanyIds: ['c1', 'c3'], createdAt: '2025-01-01' },
    { id: 'u2', name: 'Maria López (User)', email: 'maria@c2.com', companyId: 'c2', roleId: 2, allowedCompanyIds: ['c2', 'c4'], createdAt: '2025-02-15' },
    { id: 'u3', name: 'Carlos Ruiz (Admin)', email: 'carlos@admin.com', companyId: null, roleId: 3, allowedCompanyIds: COMPANIES_DB.map(c => c.id), createdAt: '2025-03-20' }, 
    { id: 'u4', name: 'Ana Soto (User)', email: 'ana@c1.com', companyId: 'c1', roleId: 2, allowedCompanyIds: ['c1'], createdAt: '2025-04-10' },
    { id: 'u5', name: 'Pedro Díaz (User)', email: 'pedro@c3.com', companyId: 'c3', roleId: 2, allowedCompanyIds: ['c3'], createdAt: '2025-05-01' }, 
    { id: 'u6', name: 'Luisa Mora (User)', email: 'luisa@c4.com', companyId: 'c4', roleId: 2, allowedCompanyIds: ['c4'], createdAt: '2025-05-01' }, 
    { id: 'u7', name: 'Felipe Reyes (Inactive)', email: 'felipe@c5.com', companyId: 'c5', roleId: 1, allowedCompanyIds: [], createdAt: '2025-06-10' }, 
];


const axios = {
    // Simula la obtención de usuarios o compañías
    get: async (url: string, config: { headers: { Authorization: string } }) => {
        // Simular latencia de red
        await new Promise(resolve => setTimeout(resolve, 300)); 

        // Endpoint de compañías: Retorna todos los datos
        if (url === `${API_BASE_URL}/companies`) {
            console.log(`[API MOCK] GET: ${url}`);
            return { data: COMPANIES_DB };
        }
        
        // Endpoint de usuarios: Retorna todos los datos
        if (url === `${API_BASE_URL}/users`) {
            console.log(`[API MOCK] GET: ${url}`);
            // Devuelve una copia del ESTADO ACTUAL de la "base de datos"
            return { data: [...USERS_DB], status: 200 }; 
        }

        throw new Error(`Endpoint no encontrado: ${url}`);
    },
    
    // Simula la actualización de permisos
    put: async (url: string, data: Partial<UserData>, config: { headers: { Authorization: string } }) => {
        // Simular latencia de guardado
        await new Promise(resolve => setTimeout(resolve, 800)); 
        
        const userIdMatch = url.match(/\/users\/(.+)$/);
        const userId = userIdMatch ? userIdMatch[1] : null;

        if (!userId || url !== `${API_BASE_URL}/users/${userId}`) {
            throw new Error(`URL de PUT inválida o falta ID de usuario: ${url}`);
        }

        // 1. Encontrar y actualizar el usuario en la "base de datos" simulada
        const userToUpdate = USERS_DB.find(u => u.id === userId);

        if (!userToUpdate) {
             throw new Error(`Usuario con ID ${userId} no encontrado.`);
        }

        const updatedUser = { 
            ...userToUpdate, 
            ...data,
            // Aseguramos que solo actualizamos allowedCompanyIds y no companyId, si es que viene en 'data'
            allowedCompanyIds: data.allowedCompanyIds || userToUpdate.allowedCompanyIds,
            companyId: userToUpdate.companyId // Mantenemos companyId
        } as UserData;
        
        // 2. Persistir el cambio en la "base de datos" simulada
        USERS_DB = USERS_DB.map(u => 
            u.id === userId ? updatedUser : u
        );

        console.log(`[API MOCK] PUT: ${url}. Permisos guardados para ${updatedUser.name}:`, updatedUser.allowedCompanyIds);
        
        // 3. Devolver la respuesta exitosa con los datos actualizados
        return { 
            data: updatedUser, 
            status: 200 
        };
    }
};

// =========================================================
// 3. COMPONENTE PRINCIPAL
// =========================================================

export default function UserListDashboard() {
    const { user, isAuthenticated, token } = useAuth(); 
    const isCurrentUserAdmin = user?.roleId === 3; 

    const [users, setUsers] = useState<UserData[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Estado para manejar el modal de edición
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Mapeo para obtener el nombre de la compañía
    const companyMap = useMemo(() => {
        return companies.reduce((map, company) => {
            map[company.id] = company.name;
            return map;
        }, {} as Record<string, string>);
    }, [companies]);

    // Función principal para obtener datos (usuarios y empresas)
    const fetchData = useCallback(async () => {
        if (!isAuthenticated || !isCurrentUserAdmin) {
             setLoading(false);
             return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Obtener lista de empresas - LLAMADA REAL A LA RUTA MOCK
            const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCompanies(companiesResponse.data);

            // 2. Obtener lista de usuarios - LLAMADA REAL A LA RUTA MOCK
            const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const usersList = usersResponse.data as UserData[];
            
            // Ordenar por nombre
            usersList.sort((a, b) => a.name.localeCompare(b.name));
            setUsers(usersList);
            
        } catch (err: any) {
            console.error("Fallo en fetchData:", err);
            // Mostrar un error más amigable si el mock falla
            const errorMessage = err.message || 'Error desconocido al cargar datos.';
            setError(`Error al cargar datos. Verifique la API o la conexión: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, token, isCurrentUserAdmin]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, fetchData]);

    // --- Manejo del Modal ---
    
    const handleEditClick = (userToEdit: UserData) => {
        setEditingUser(userToEdit);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSavePermissions = async (updatedIds: string[]) => {
        if (!editingUser) return;
        
        setIsSaving(true);
        setError(null);

        try {
            // 1. Llamada a la API de actualización - LLAMADA REAL A LA RUTA MOCK
            const response = await axios.put(`${API_BASE_URL}/users/${editingUser.id}`, 
                { id: editingUser.id, allowedCompanyIds: updatedIds }, 
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            // 2. Actualizar el estado local (users) con los nuevos datos
            const updatedUser = response.data as UserData;
            setUsers(prevUsers => prevUsers.map(u => 
                u.id === updatedUser.id ? updatedUser : u
            ));
            
            handleCloseModal(); // Cerrar modal al éxito
        } catch (err: any) {
            console.error("Error al guardar permisos:", err);
            const errorMessage = err.message || 'Error desconocido al guardar.';
            setError(`Fallo al guardar permisos: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };


    // --- Renderizado ---

    if (!isCurrentUserAdmin) {
        return (
            <div className="p-8 bg-white rounded-xl shadow-lg text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <h1 className="text-xl font-bold text-red-700">Acceso Denegado</h1>
                <p className="mt-2 text-gray-600">No tiene los permisos de administrador necesarios para gestionar esta página.</p>
            </div>
        );
    }
    
    const dashboardTitle = "Gestión de Permisos de Empresa por Usuario"; 

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Key className="w-6 h-6 mr-3 text-indigo-500" /> {dashboardTitle}
            </h1>
            <p className="mt-1 text-sm text-gray-600 mb-6">
                Como Administrador, asigne qué facturas (vinculadas a Empresas) puede ver cada usuario.
            </p>

            {/* Spinner de Carga */}
            {loading && (
                <div className="flex items-center justify-center p-8 bg-blue-50 rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                    <span className="text-blue-600 font-medium">Cargando usuarios y empresas...</span>
                </div>
            )}

            {/* Mensaje de Error */}
            {error && !loading && (
                <div className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100" role="alert">
                    <AlertTriangle className="w-5 h-5 mr-3" />
                    <div>
                        <span className="font-medium">Error:</span> {error}
                    </div>
                </div>
            )}

            {/* Listado de Usuarios */}
            {!loading && !error && users.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <Th icon={User} label="USUARIO" />
                                <Th icon={Mail} label="EMAIL" />
                                <Th icon={Building} label="COMPAÑÍA PRINCIPAL" />
                                <Th icon={Key} label="PERMISOS DE EMPRESA" />
                                <Th icon={Pencil} label="ACCIONES" />
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <Td>{user.name}</Td>
                                    <Td>{user.email}</Td>
                                    <Td className="font-medium text-gray-500">{user.companyId ? companyMap[user.companyId] || user.companyId : 'N/A'}</Td>
                                    <Td>
                                        <PermissionBadge count={user.allowedCompanyIds.length} total={companies.length} />
                                    </Td>
                                    <Td>
                                        <button 
                                            onClick={() => handleEditClick(user)}
                                            className="px-3 py-1 bg-indigo-500 text-white rounded-full text-xs font-medium hover:bg-indigo-600 transition flex items-center"
                                            title={`Editar permisos para ${user.name}`}
                                        >
                                            <Pencil className="w-3 h-3 mr-1" /> Editar
                                        </button>
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* Modal de Edición de Permisos */}
            {isModalOpen && editingUser && (
                <PermissionModal 
                    user={editingUser}
                    allCompanies={companies}
                    onClose={handleCloseModal}
                    onSave={handleSavePermissions}
                    isSaving={isSaving}
                />
            )}

        </div>
    );
}

// =========================================================
// 4. COMPONENTES AUXILIARES
// =========================================================

// Modal para la edición de permisos
interface PermissionModalProps {
    user: UserData;
    allCompanies: Company[];
    onClose: () => void;
    onSave: (updatedIds: string[]) => void;
    isSaving: boolean;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ user, allCompanies, onClose, onSave, isSaving }) => {
    // Si el usuario es Admin (roleId 3), no permitimos cambiar los IDs seleccionados.
    const isAdmin = user && user.roleId === 3; 

    // Si es Admin, los IDs seleccionados son todas las IDs de las compañías para reflejar el acceso total.
    const initialSelectedIds = isAdmin ? allCompanies.map(c => c.id) : user.allowedCompanyIds;
    const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
    
    // Si el usuario es un Admin, deshabilitamos la interacción para evitar sobrescribir su acceso total.
    const isInteractiveDisabled = isAdmin || isSaving;

    const handleCheckboxChange = (companyId: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedIds(prev => [...prev, companyId]);
        } else {
            setSelectedIds(prev => prev.filter(id => id !== companyId));
        }
    };

    const handleToggleAll = (toggle: boolean) => {
        if (toggle) {
            setSelectedIds(allCompanies.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSubmit = () => {
        // Solo guarda si no es Admin y no está ya guardando
        if (!isAdmin && !isSaving) {
            onSave(selectedIds);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <Key className="w-5 h-5 mr-2 text-indigo-600" />
                        Permisos para: {user.name}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="mb-4 text-sm text-gray-600">
                        Seleccione las empresas cuyas facturas este usuario puede visualizar. Actualmente tiene permiso para {selectedIds.length} de {allCompanies.length}.
                    </p>
                    
                    {/* Mensaje para el Admin del Sistema */}
                    {isAdmin && (
                        <div className="p-3 mb-4 text-sm text-blue-800 rounded-lg bg-blue-100">
                            <span className="font-bold">Nota:</span> Este usuario es un Administrador del Sistema. Por defecto, tiene acceso a **TODAS** las empresas y sus permisos no pueden ser modificados.
                        </div>
                    )}

                    <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                            <span className="font-semibold text-gray-700">Empresas ({selectedIds.length}/{allCompanies.length})</span>
                            <div className="text-sm">
                                <button 
                                    onClick={() => handleToggleAll(selectedIds.length !== allCompanies.length)}
                                    className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                                    disabled={isInteractiveDisabled}
                                >
                                    {selectedIds.length === allCompanies.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 h-64 overflow-y-auto pr-2">
                            {allCompanies.map((company) => (
                                <label key={company.id} className={`flex items-center space-x-3 text-gray-700 cursor-pointer p-1 rounded transition duration-100 ${!isInteractiveDisabled ? 'hover:bg-gray-100' : 'opacity-70 cursor-default'}`}>
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                                        checked={selectedIds.includes(company.id)}
                                        onChange={(e) => handleCheckboxChange(company.id, e.target.checked)}
                                        disabled={isInteractiveDisabled}
                                    />
                                    <span className="text-sm font-medium">{company.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center ${
                            isSaving || isAdmin
                                ? 'bg-indigo-300 text-white cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                        disabled={isSaving || isAdmin}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" /> Guardar Permisos
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Componente Badge para mostrar el conteo de permisos
const PermissionBadge: React.FC<{ count: number, total: number }> = ({ count, total }) => {
    let colorClass = 'bg-gray-100 text-gray-800';
    if (count === total) {
        colorClass = 'bg-green-100 text-green-800';
    } else if (count > 0) {
        colorClass = 'bg-indigo-100 text-indigo-800';
    } else if (count === 0) {
        colorClass = 'bg-red-100 text-red-800';
    }

    return (
        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {count === total ? 'Acceso Total' : `${count} de ${total} Empresas`}
        </span>
    );
};

// Componente para el encabezado de la tabla
interface ThProps {
    icon: React.ElementType;
    label: string;
}
const Th: React.FC<ThProps> = ({ icon: Icon, label }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none cursor-pointer hover:bg-gray-100 transition duration-150">
        <div className="flex items-center">
            <Icon className="w-4 h-4 mr-2" />
            {label}
            {label !== 'ACCIONES' && <ArrowDownUp className="w-3 h-3 ml-1 text-gray-400" />}
        </div>
    </th>
);

// Componente para celdas de datos
interface TdProps {
    children: React.ReactNode;
    className?: string;
}
const Td: React.FC<TdProps> = ({ children, className = '' }) => (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
        {children}
    </td>
);