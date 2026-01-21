"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Iconos de lucide-react
import { 
    User, Mail, Key, Loader2, AlertTriangle, ArrowDownUp, Building, Pencil, X, Save, PlusCircle, Lock 
} from 'lucide-react';

// =========================================================
// 0. CONFIGURACIÓN E IMPORTACIONES REALES
// =========================================================

// 🚨 IMPORTACIÓN REAL DE AXIOS
import axios from 'axios'; 

// 🔑 RUTA CORREGIDA: Apuntando al archivo que encontraste.
// ⚠️ Si esta ruta sigue en rojo, ajusta los `../` hasta que desaparezca el error.
import { useAuth } from '../context/AuthContext'; 
//NUEVOO
import EditRoleModal from './EditRoleModal';
import { Trash2 } from 'lucide-react'; // Asegúrate de importar el ícono si lo usas
import Swal from 'sweetalert2'; // Se requiere SweetAlert2 para la confirmación
import toast from 'react-hot-toast';

// RUTAS DE API REALES
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin`; 

// =========================================================
// 1. TIPADO DE DATOS
// =========================================================

interface Company {
    id: string;
    name: string;
}

// Interfaz para los datos de usuario devueltos por la API y usados en el componente.
interface UserData {
    id: string;
    name: string;
    email: string;
    companyId: string | null; 
    allowedCompanyIds: string[]; 
    roleId: number; // 3 para Admin, 2 para Regular
    createdAt: string | Date; 
}

// Tipo de datos que se enviarán al API para la creación
interface NewUserDataPayload {
    name: string;
    email: string;
    password: string;
    companyId: string | null;
    roleId: number;
}


// Definición de la interfaz para el tipo de rol
interface Role {
    id: number;
    name: string;
}

// Mapeo de Roles para el formulario de nuevo usuario
const ROLES: Role[] = [ // Usa Role[] en lugar del tipado inline erróneo
    { id: 4, name: 'Usuario Regular' }, 
    { id: 3, name: 'Administrador' },
];


// Función para obtener el nombre del rol por ID (la tabla la necesita)
const getRoleName = (roleId: number | null | undefined): string => {
    // 1. Manejar valores nulos o indefinidos inmediatamente
    if (roleId === null || roleId === undefined) {
        return 'Usuario'; // O el texto que prefieras
    }
    
    // 2. Buscar el rol
    const role = ROLES.find(r => r.id === roleId);
    
    // 3. Devolver el nombre o el rol desconocido (sin el ID si es desconocido)
    return role ? role.name : 'Rol Desconocido'; // Quitamos el (${roleId})
};


// =========================================================
// 2. COMPONENTE PRINCIPAL UserListDashboard
// =========================================================

export default function UserListDashboard() {
    // ESTO VIENE DE useAuth: { user, isAuthenticated, token, isLoading, login, logout }
    const auth = useAuth();
    
    // Aseguramos que user no sea null antes de acceder a roleId
    const isCurrentUserAdmin = auth.user && auth.user.roleId === 3; 
    const isAuthenticated = auth.isAuthenticated;
    const token = auth.token;


    const [users, setUsers] = useState<UserData[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    //NUEVOO
    const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
    const [userToEditRole, setUserToEditRole] = useState<UserData | null>(null);
    const [isUpdatingRole, setIsUpdatingRole] = useState(false);
    
    // Estados para la funcionalidad de Edición
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Estados para el Add User
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddingUser, setIsAddingUser] = useState(false);
     // ⬅️ 1. NUEVO ESTADO: Guarda el usuario que vamos a editar.
    const [userBeingEdited, setUserBeingEdited] = useState<UserData | null>(null);

    // Modificación de handleCloseAddModal
    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setUserBeingEdited(null); // CRUCIAL: Limpia el estado
    };

    // Nueva función para manejar el clic en la tabla
    /* const handleEditRoleClick = (user: UserData) => {
        setUserBeingEdited(user);
        setIsAddModalOpen(true);
    }; */


    // Mapeo para obtener el nombre de la compañía
    //ESTO ES LO QUE HAYQUEQUITAR LUEGO 
    const companyMap = useMemo(() => {
        return companies.reduce((map, company) => {
            map[company.id] = company.name;
            return map;
        }, {} as Record<string, string>);
    }, [companies]);

    // Función para obtener usuarios y empresas de las APIs reales
    const fetchData = useCallback(async () => {
        // Bloqueo si el usuario no es admin o no está autenticado
        if (!isAuthenticated || !isCurrentUserAdmin || !token) {
             setLoading(false);
             // Si no está autenticado, el hook AuthProvider se encargará de mostrar el mensaje "Verificando sesión..."
             return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. LLAMADA A EMPRESAS - RUTA REAL: http://localhost:3000/api/admin/companies
            const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const companiesList = companiesResponse.data as Company[];
            setCompanies(companiesList);

            // 2. LLAMADA A USUARIOS - RUTA REAL: http://localhost:3000/api/admin/users
            const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            let usersList = usersResponse.data as UserData[];
            
            // FILTRO DE SEGURIDAD: Excluimos al usuario autenticado de la lista de edición
            usersList = usersList.filter(u => u.id !== auth.user.id);

            // Ordenar por nombre
            usersList.sort((a, b) => a.name.localeCompare(b.name));
            setUsers(usersList);
            
        } catch (err: any) {
            console.error("Fallo en fetchData:", err);
            // Captura el mensaje de error real de la API
            const errorMessage = err.response?.data?.message || err.message || 'Error desconocido al cargar datos.';
            setError(`Error al cargar datos. Verifique la API, la conexión o el Token: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, token, isCurrentUserAdmin, auth.user]);

    useEffect(() => {
        // Solo intentamos cargar datos si el hook de autenticación ha terminado de cargar
        if (!auth.isLoading && isAuthenticated) {
            fetchData();
        }
    }, [auth.isLoading, isAuthenticated, fetchData]);

    // --- Manejo del Modal de Edición ---
    
    const handleEditClick = (userToEdit: UserData) => {
        setEditingUser(userToEdit);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingUser(null);
    };

  const handleSavePermissions = async (updatedIds: string[]) => {
    // Aseguramos que el usuario que se edita y el token existen
    if (!editingUser || !token) {
        toast.error("Error de sesión o usuario no seleccionado.");
        return;
    }
    
    // **IMPORTANTE:** Verificar si editingUser.id es válido antes de la llamada.
    if (!editingUser.id) {
         toast.error("Error: ID de usuario no encontrado para la actualización.");
         return;
    }

    setIsSaving(true);
    setError(null);

    // 1. Convertir los IDs de string (del checkbox) a number (para la DB)
    const companyIdsAsNumbers = updatedIds.map(id => parseInt(id, 10));

    try {
    const payload = {
    name: editingUser.name, 
    email: editingUser.email, 
    roleId: editingUser.roleId ? Number(editingUser.roleId) : 4, 
    companyIds: companyIdsAsNumbers
};

    // USAR ESTA LÍNEA:
    const fullApiUrl = `${API_BASE_URL}/users/${parseInt(editingUser.id, 10)}`; 
    
    const response = await axios.put(fullApiUrl, payload, { 
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } 
    });

       // El backend devuelve el objeto de usuario actualizado.
        const updatedUser = response.data as UserData;
        
        // Actualizar el estado de la lista de usuarios
        setUsers(prevUsers => prevUsers.map(u => 
            String(u.id) === String(editingUser.id) 
                ? { 
                    ...u, 
                    ...updatedUser, 
                    allowedCompanyIds: updatedIds // Esto asegura que el Badge cambie al instante
                  } 
                : u
        ));
        
        handleCloseEditModal();
        toast.success("Permisos de empresa actualizados con éxito."); 
    } catch (err: any) {
        console.error("Error al guardar permisos:", err);
        
        // Manejo mejorado para extraer el mensaje de error del backend
        const apiError = err.response?.data?.error || err.response?.data?.message || err.message;
        setError(`Fallo al guardar permisos: ${apiError}`);
        toast.error(`Error al actualizar: ${apiError}`);
    } finally {
        setIsSaving(false);
    }
};
    // --- Manejo del Modal de Creación (Add User) ---
    
    const handleOpenAddModal = () => {
        setError(null);
        setIsAddModalOpen(true);
    };

    // UserListDashboard.tsx (Sección de Funciones)

// Función que abre el nuevo modal
const handleEditRoleClick = (user: UserData) => {
    setUserToEditRole(user);
    setIsEditRoleModalOpen(true);
};

// Función que cierra el nuevo modal y limpia el estado
const handleCloseEditRoleModal = () => {
    setIsEditRoleModalOpen(false);
    setUserToEditRole(null);
};

// Función que maneja la llamada a la API desde el modal (lo que estaba en onSave)
// UserListDashboard.tsx (Función handleSaveNewRole)

// UserListDashboard.tsx (Función handleSaveNewRole)


const getAuthToken = (): string | null => {
    // 🚨 Usamos la clave 'token' que encontramos en AuthContext.tsx
    const token = localStorage.getItem('token'); 
    return token;
};

const handleSaveNewRole = async (userId: string, newRoleId: number) => {
    setIsUpdatingRole(true);
    const token = getAuthToken(); 
    const userToUpdate = userToEditRole; 

    if (!userToUpdate || !token) { 
        console.error("Operación cancelada: Token o datos de usuario ausentes.");
        setIsUpdatingRole(false);
        return;
    }

    try {
        // 🚨 CORRECCIÓN CLAVE: Enviamos 'companyIds' (el array de permisos)
        // para no borrar las empresas que ya tiene permitidas el usuario.
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, { 
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                name: userToUpdate.name,
                email: userToUpdate.email,
                roleId: newRoleId,
                // Mapeamos los IDs actuales a números para que el backend los procese correctamente
                companyIds: userToUpdate.allowedCompanyIds.map(id => parseInt(id))
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Fallo en la actualización: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error || errorJson.message || errorMessage;
            } catch { /* no-op */ }
            throw new Error(errorMessage);
        }
        
        // Actualizamos el estado local para que la tabla refleje el cambio de rol inmediatamente
        setUsers(prevUsers => 
            prevUsers.map(u => 
                u.id === userId ? { ...u, roleId: newRoleId } : u
            )
        );

        handleCloseEditRoleModal();
        toast.success("Rol actualizado con éxito"); // Opcional si usas react-hot-toast

    } catch (error: any) {
        console.error("Error al actualizar el rol:", error);
        // Si usas SweetAlert2 (Swal):
        // Swal.fire('Error', error.message, 'error');
    } finally {
        setIsUpdatingRole(false);
    }
};

const handleDeleteUser = async (userId: number) => {
    // 1. CONFIRMACIÓN DE SEGURIDAD
    const confirmation = await Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto! El usuario y sus datos serán eliminados.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33', // Rojo
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar!',
        cancelButtonText: 'Cancelar'
    });

    if (!confirmation.isConfirmed) {
        return; 
    }

    const token = getAuthToken();
    if (!token) {
        console.error("Token de autenticación no encontrado.");
        Swal.fire('Error', 'No estás autenticado.', 'error');
        return;
    }

    // 2. LLAMADA A LA API (DELETE)
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, {
            method: 'DELETE', 
            headers: {
                'Authorization': `Bearer ${token}` 
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Fallo al eliminar: ${response.status} ${response.statusText}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error || errorJson.message || errorMessage;
            } catch {}
            throw new Error(errorMessage);
        }

        // 3. ACTUALIZACIÓN DE ESTADO (Frontend)
        // Eliminamos el usuario de la lista local para que desaparezca sin recargar.
        setUsers(prevUsers => prevUsers.filter(user => 
    // 🚨 SOLUCIÓN: Convertir el ID de la lista (user.id) a número 
    // antes de compararlo con el userId (que ya es un número).
    parseInt(user.id) !== userId 
));

Swal.fire('Eliminado!', 'El usuario ha sido eliminado correctamente.', 'success');

    } catch (error) {
        console.error("Error al eliminar el usuario:", error);
        Swal.fire('Error FATAL', (error as Error).message, 'error');
    }
};


 /*    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
    }; */

    const handleAddUser = async (newUserData: NewUserDataPayload) => {
        console.log("1. INICIANDO LLAMADA A API para crear usuario:", newUserData);
        if (!token) {
            setError("No se encontró token de autenticación. Inicie sesión nuevamente.");
            return;
        }

        setIsAddingUser(true);
        setError(null);

        try {
            // LLAMADA A LA API DE CREACIÓN - RUTA REAL
            const response = await axios.post(`${API_BASE_URL}/users`, 
                newUserData,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            const createdUser = response.data as UserData;

            // 1. Cerrar modal
            handleCloseAddModal();
            // 2. Actualizar el estado localmente
            setUsers(prevUsers => {
                const updatedUsers = [...prevUsers, createdUser].sort((a, b) => a.name.localeCompare(b.name));
                return updatedUsers;
            });
            
        } catch (err: any) {
            console.error("Error al crear usuario:", err);
            // El backend devuelve el mensaje de error de validación o duplicado
            const apiError = err.response?.data?.message || err.message;
            const errorMessage = apiError || 'Error desconocido al crear el usuario.';
            setError(`Fallo en la creación: ${errorMessage}`);
        } finally {
            setIsAddingUser(false);
        }
    };


    // --- Renderizado ---

    if (auth.isLoading) {
        return (
            <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-lg">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mr-2" />
                <span className="text-indigo-600 font-medium">Cargando estado de autenticación...</span>
            </div>
        );
    }

    if (!isCurrentUserAdmin) {
        return (
            <div className="p-8 bg-white rounded-xl shadow-lg text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <h1 className="text-xl font-bold text-red-700">Acceso Denegado</h1>
                <p className="mt-2 text-gray-600">No tiene los permisos de administrador necesarios para gestionar esta página.</p>
                <button onClick={auth.logout} className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cerrar Sesión</button>
            </div>
        );
    }
    
    const dashboardTitle = "Gestión de Permisos de Empresa por Usuario"; 

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">
                    {users.length} usuarios registrados
                </span>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
                >
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Nuevo Usuario
                </button>
            </div>

            {/* Spinner de Carga */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                    <span className="text-gray-500">Cargando usuarios...</span>
                </div>
            )}

            {/* Mensaje de Error */}
            {error && !loading && (
                <div className="flex items-center p-4 m-4 text-sm text-red-700 rounded-md bg-red-50 border border-red-200" role="alert">
                    <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Tabla de Usuarios */}
            {!loading && !error && users.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Usuario</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rol</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Permisos</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user, idx) => (
                                <tr key={user.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 transition-colors`}>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                            user.roleId === 3 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {getRoleName(user.roleId)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <PermissionBadge
                                            count={user.roleId === 3 ? companies?.length || 0 : user.allowedCompanyIds?.length || 0}
                                            total={companies?.length || 0}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => handleEditRoleClick(user)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Cambiar rol">
                                                <Key className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleEditClick(user)} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-100 rounded transition-colors" title="Editar permisos">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteUser(parseInt(user.id))} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded transition-colors" title="Eliminar usuario">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Estado vacío */}
            {!loading && !error && users.length === 0 && (
                <div className="p-8 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                    <User className="w-6 h-6 text-yellow-500 mx-auto mb-3" />
                    <p className="text-yellow-800 font-medium">No se encontraron usuarios en la base de datos (aparte de su propia cuenta de administrador).</p>
                </div>
            )}
            
            {/* Modal de Edición de Permisos */}
            {isEditModalOpen && editingUser && (
                <PermissionModal 
                    user={editingUser}
                    allCompanies={companies}
                    onClose={handleCloseEditModal}
                    onSave={handleSavePermissions}
                    isSaving={isSaving}
                />
            )}

            {/* Modal de Creación de Usuario */}
            {isAddModalOpen && (
                <AddUserModal
                    allCompanies={companies}
                    allRoles={ROLES}
                    onClose={handleCloseAddModal}
                    onSave={handleAddUser}
                    isSaving={isAddingUser}
                />
            )}

            {/* ⬅️ ¡NUEVO MODAL PARA EDICIÓN DE ROL! */}
            {isEditRoleModalOpen && userToEditRole && (
                <EditRoleModal
                    user={userToEditRole} // ⬅️ Le pasamos el usuario completo
                    allRoles={ROLES}
                    onClose={handleCloseEditRoleModal}
                    onSave={handleSaveNewRole} // ⬅️ Le pasamos la función de guardado
                    isSaving={isUpdatingRole}
                />
            )}

        </div>
    );
}

// --------------------------------------------------------------------------------
// 3. COMPONENTE PARA AGREGAR USUARIO (AddUserModal)
// --------------------------------------------------------------------------------

interface AddUserModalProps {
    allCompanies: Company[];
    allRoles: typeof ROLES;
    onClose: () => void;
    onSave: (newUserData: NewUserDataPayload) => void;
    isSaving: boolean;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ allCompanies, allRoles, onClose, onSave, isSaving }) => {
    // Si no hay compañías, el valor inicial debe ser null
    const defaultCompanyId = useMemo(() => {
        return allCompanies.length > 0 ? allCompanies[0].id : null;
    }, [allCompanies]);

    const [formData, setFormData] = useState<NewUserDataPayload>({
        name: '',
        email: '',
        password: '',
        companyId: defaultCompanyId,
        roleId: 4, // Default to 'Usuario Regular'
    });
    const [formError, setFormError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === "" && name === "companyId" ? null : name === "roleId" ? parseInt(value) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        // Validación básica
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
            setFormError("Nombre, Email y Contraseña son campos obligatorios.");
            return;
        }
        if (formData.password.length < 6) {
            setFormError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col transform transition-transform duration-300 scale-95 opacity-100">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <PlusCircle className="w-5 h-5 mr-2 text-green-600" />
                        Crear Nuevo Usuario
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex-grow overflow-y-auto">
                    {/* Mensaje de Error del Formulario */}
                    {formError && (
                        <div className="flex items-center p-3 mb-4 text-sm text-red-800 rounded-lg bg-red-100 border border-red-300">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            <div>{formError}</div>
                        </div>
                    )}

                    {/* Campo Nombre */}
                    <InputField 
                        label="Nombre Completo" 
                        name="name" 
                        type="text" 
                        value={formData.name} 
                        onChange={handleChange as any} // Cast
                        icon={User}
                        required
                        disabled={isSaving}
                    />

                    {/* Campo Email */}
                    <InputField 
                        label="Email" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleChange as any} // Cast
                        icon={Mail}
                        required
                        disabled={isSaving}
                    />

                    {/* Campo Contraseña */}
                    <InputField 
                        label="Contraseña (Mín. 6 caracteres)" 
                        name="password" 
                        type="password" 
                        value={formData.password} 
                        onChange={handleChange as any} // Cast
                        icon={Lock}
                        required
                        disabled={isSaving}
                    />
                    
                    {/* Campo Compañía Principal */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <Building className="w-4 h-4 mr-2 text-gray-500" /> Compañía Principal (Opcional)
                        </label>
                        <select
                            name="companyId"
                            value={formData.companyId || ""}
                            onChange={handleChange}
                            disabled={isSaving || allCompanies.length === 0}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        >
                            <option value="">-- Ninguna (Admin o Usuario Global) --</option>
                            {allCompanies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {allCompanies.length === 0 && <p className="text-xs text-red-500 mt-1">No hay compañías disponibles para asignar.</p>}
                    </div>

                    {/* Campo Rol */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <Key className="w-4 h-4 mr-2 text-gray-500" /> Rol del Usuario
                        </label>
                        <select
                            name="roleId"
                            value={formData.roleId}
                            onChange={handleChange}
                            disabled={isSaving}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        >
                            {allRoles.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        onClick={handleSubmit}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center shadow-md ${
                            isSaving
                                ? 'bg-green-300 text-white cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700 shadow-green-600/30'
                        }`}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creando...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" /> Crear Usuario
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --------------------------------------------------------------------------------
// 4. COMPONENTES AUXILIARES
// --------------------------------------------------------------------------------

// Componente auxiliar para campos de formulario
interface InputFieldProps {
    label: string;
    name: keyof NewUserDataPayload;
    type: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; // Acepta ambos
    icon: React.ElementType;
    required?: boolean;
    disabled: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, type, value, onChange, icon: Icon, required = false, disabled }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Icon className="w-4 h-4 mr-2 text-gray-500" /> {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange as any} // Cast
            required={required}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
        />
    </div>
);

// Modal para la edición de permisos
interface PermissionModalProps {
    user: UserData;
    allCompanies: Company[];
    onClose: () => void;
    onSave: (updatedIds: string[]) => void;
    isSaving: boolean;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ user, allCompanies, onClose, onSave, isSaving }) => {
    const isAdmin = user && user.roleId === 3; 

    // Si es Admin, inicializamos con todas las IDs, pero el modal estará deshabilitado.
    const initialSelectedIds = useMemo(() => {
        return isAdmin ? allCompanies.map(c => c.id) : user.allowedCompanyIds;
    }, [isAdmin, allCompanies, user.allowedCompanyIds]);

    const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
    
    // Si el usuario es un Admin, deshabilitamos la interacción para evitar sobrescribir su acceso total.
    const isInteractiveDisabled = isAdmin || isSaving;

    const handleCheckboxChange = (companyId: string, isChecked: boolean) => {
        if (isInteractiveDisabled) return; // Protección adicional

        if (isChecked) {
            setSelectedIds(prev => [...prev, companyId]);
        } else {
            setSelectedIds(prev => prev.filter(id => id !== companyId));
        }
    };

    const handleToggleAll = (toggle: boolean) => {
        if (isInteractiveDisabled) return; // Protección adicional

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
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-transform duration-300 scale-95 opacity-100">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <Key className="w-5 h-5 mr-2 text-indigo-600" />
                        Permisos para: {user.name}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto">
                    <p className="mb-4 text-sm text-gray-600">
                        Seleccione las empresas a las que este usuario tiene acceso. Actualmente tiene permiso para **{selectedIds.length}** de {allCompanies.length}.
                    </p>
                    
                    {/* Mensaje para el Admin del Sistema */}
                    {isAdmin && (
                        <div className="p-3 mb-4 text-sm text-blue-800 rounded-lg bg-blue-100 border border-blue-300">
                            <span className="font-bold">Nota:</span> Este usuario es un Administrador del Sistema (`roleId: 3`) y tiene acceso a **TODAS** las empresas por defecto. Los permisos no pueden ser modificados.
                        </div>
                    )}

                    <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                            <span className="font-semibold text-gray-700">Empresas ({selectedIds.length}/{allCompanies.length})</span>
                            <div className="text-sm">
                                <button 
                                    onClick={() => handleToggleAll(selectedIds.length !== allCompanies.length)}
                                    className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50 font-medium"
                                    disabled={isInteractiveDisabled}
                                >
                                    {selectedIds.length === allCompanies.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 max-h-64 overflow-y-auto pr-2">
                            {allCompanies.map((company) => (
                                <label key={company.id} className={`flex items-center space-x-3 text-gray-700 cursor-pointer p-1 rounded transition duration-100 ${!isInteractiveDisabled ? 'hover:bg-gray-100' : 'opacity-70 cursor-default'}`}>
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-indigo-600 rounded disabled:opacity-50"
                                        checked={selectedIds.includes(company.id)}
                                        onChange={(e) => handleCheckboxChange(company.id, e.target.checked)}
                                        disabled={isInteractiveDisabled}
                                    />
                                    <span className={`text-sm font-medium ${isInteractiveDisabled ? 'text-gray-500' : ''}`}>{company.name}</span>
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
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center shadow-md ${
                            isSaving || isAdmin
                                ? 'bg-indigo-300 text-white cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30'
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
    if (count === total && total > 0) {
        colorClass = 'bg-green-100 text-green-800';
    } else if (count > 0 && count < total) {
        colorClass = 'bg-indigo-100 text-indigo-800';
    } else if (count === 0 && total > 0) {
        colorClass = 'bg-red-100 text-red-800';
    } else if (total === 0) {
        colorClass = 'bg-yellow-100 text-yellow-800'; // Caso sin empresas
    }

    return (
        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {total === 0 ? 'Sin Empresas' : count === total ? 'Acceso Total' : `${count} de ${total} Empresas`}
        </span>
    );
};

// Componente para el encabezado de la tabla
interface ThProps {
    icon: React.ElementType;
    label: string;
}
const Th: React.FC<ThProps> = ({ icon: Icon, label }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none">
        <div className="flex items-center">
            <Icon className="w-4 h-4 mr-2" />
            {label}
            {/* Se deja el icono de ordenación para indicar que es posible, aunque la lógica no esté implementada */}
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
    <td className={`px-6 py-4 whitespace-nowrap text-sm ${className}`}>
        {children}
    </td>
);