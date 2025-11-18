import React, { useState, useEffect, useCallback } from 'react';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Mock Data para simular la carga inicial (la reemplazaremos con la API más tarde)
const MOCK_USERS = [
    { id: 1, name: "Ana López", email: "ana.lopez@example.com" },
    { id: 2, name: "Carlos Ruiz", email: "carlos.ruiz@example.com" },
    { id: 3, name: "Elena Gómez", email: "elena.gomez@example.com" },
];

const MOCK_COMPANIES = [
    { id: 101, name: "Tech Solutions S.A." },
    { id: 102, name: "Global Marketing Ltda." },
    { id: 103, name: "Innovate Finance Corp." },
    { id: 104, name: "Retail Pro México" },
    { id: 105, name: "Logistics Hub C.A." },
];

// Configuración de Firebase y Firestore (Necesaria para autenticación y persistencia si se usara)
// Utilizamos las variables globales proporcionadas por el entorno de Canvas.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// URL base de tu API (Asegúrate de cambiar esto por la URL correcta de tu entorno si es necesario)
const API_BASE_URL = '/api/admin/permissions';

// ID del rol predeterminado para los permisos (asumiendo 1 = 'User' o 'Asignado')
const DEFAULT_ROLE_ID = 1; 

const AdminPermissionsManager = () => {
    // --- ESTADOS PRINCIPALES ---
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null); // Para mensajes de éxito/error

    // Estado para la gestión de permisos
    const [users, setUsers] = useState(MOCK_USERS);
    const [companies, setCompanies] = useState(MOCK_COMPANIES);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [assignedCompanyIds, setAssignedCompanyIds] = useState([]); // IDs de empresas marcadas para el usuario

    // --- CONEXIÓN FIREBASE & AUTENTICACIÓN ---
    useEffect(() => {
        const initializeFirebase = async () => {
            try {
                const app = initializeApp(firebaseConfig);
                const authInstance = getAuth(app);
                setAuth(authInstance);

                if (initialAuthToken) {
                    await signInWithCustomToken(authInstance, initialAuthToken);
                } else {
                    await signInAnonymously(authInstance);
                }
                
                const currentUserId = authInstance.currentUser?.uid || 'anonymous';
                setUserId(currentUserId);
                
                // En un entorno real, aquí cargarías los datos iniciales
                // fetchInitialData(authInstance.currentUser?.uid);
                
            } catch (err) {
                console.error("Firebase/Auth error:", err);
                setError("Error de autenticación: no se pudo iniciar sesión.");
            } finally {
                setIsLoading(false);
            }
        };
        initializeFirebase();
    }, []);

    // --- LÓGICA DE MANEJO DE ESTADO DE PERMISOS ---

    // Maneja la selección/deselección de una empresa
    const handleCompanyToggle = (companyId) => {
        setAssignedCompanyIds(prev => {
            if (prev.includes(companyId)) {
                return prev.filter(id => id !== companyId); // Deseleccionar
            } else {
                return [...prev, companyId]; // Seleccionar
            }
        });
    };

    // Resalta si una empresa está asignada
    const isAssigned = (companyId) => assignedCompanyIds.includes(companyId);

    // Maneja el cambio de usuario seleccionado en el dropdown
    const handleUserChange = (e) => {
        const newUserId = e.target.value;
        setSelectedUserId(newUserId);
        setAssignedCompanyIds([]); // Limpiar la lista de asignaciones al cambiar de usuario
        setStatusMessage(null); // Limpiar mensaje de estado

        // En un paso posterior: Aquí llamaremos a fetchUserPermissions(newUserId)
        console.log(`Usuario seleccionado: ${newUserId}. Se cargarían sus permisos.`);
    };

    // Maneja el guardado de los permisos
    const handleSavePermissions = async () => {
        if (!selectedUserId) {
            setStatusMessage({ type: 'error', text: 'Por favor, selecciona un usuario primero.' });
            return;
        }

        setStatusMessage({ type: 'info', text: 'Guardando permisos...' });
        
        const payload = {
            userId: parseInt(selectedUserId),
            companyIds: assignedCompanyIds,
            defaultRoleId: DEFAULT_ROLE_ID,
        };
        
        console.log("Datos a enviar:", payload);

        // En un paso posterior: Aquí irá la llamada POST a /api/admin/permissions/assign-companies
        
        // Simulación de éxito (eliminar en la implementación real)
        setTimeout(() => {
            setStatusMessage({ type: 'success', text: `Permisos guardados con éxito para el usuario ${selectedUserId}.` });
        }, 1500);
    };

    // --- COMPONENTES DE ICONOS ---
    const IconUser = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    const IconBuilding = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>;
    const IconSave = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
    const IconCheck = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
    const IconAlert = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>;

    // --- COMPONENTE DE ESTADO/ERROR ---
    const StatusDisplay = ({ message }) => {
        if (!message) return null;

        let bgColor, textColor, Icon;
        switch (message.type) {
            case 'success':
                bgColor = 'bg-green-100 border-green-400';
                textColor = 'text-green-700';
                Icon = IconCheck;
                break;
            case 'error':
                bgColor = 'bg-red-100 border-red-400';
                textColor = 'text-red-700';
                Icon = IconAlert;
                break;
            case 'info':
            default:
                bgColor = 'bg-blue-100 border-blue-400';
                textColor = 'text-blue-700';
                Icon = IconAlert; // Usamos Alert para info/loading
                break;
        }

        return (
            <div className={`p-3 mt-4 border rounded-lg flex items-center shadow-md ${bgColor}`}>
                <Icon className={`w-5 h-5 mr-3 ${textColor}`} />
                <p className={`text-sm font-medium ${textColor}`}>{message.text}</p>
            </div>
        );
    };

    // --- RENDERIZADO PRINCIPAL ---
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
                <p className="text-xl font-medium text-gray-700">Cargando la interfaz de administración...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50 p-6">
                <p className="text-xl font-bold text-red-800">Error Crítico: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 sm:p-10">
                
                {/* Título Principal */}
                <header className="mb-8 border-b pb-4">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                        <IconUser className="w-8 h-8 mr-3 text-indigo-600"/>
                        Gestor de Permisos de Empresa
                    </h1>
                    <p className="mt-2 text-gray-500">Asigne o revoque el acceso a las empresas para cada usuario del sistema.</p>
                </header>

                {/* Paso 1: Selección de Usuario */}
                <div className="mb-8 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                    <label htmlFor="user-select" className="block text-lg font-semibold text-indigo-700 mb-3">
                        1. Seleccione un Usuario
                    </label>
                    <div className="relative">
                        <select
                            id="user-select"
                            value={selectedUserId}
                            onChange={handleUserChange}
                            className="block w-full px-4 py-3 pr-10 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 appearance-none transition duration-150 ease-in-out"
                        >
                            <option value="" disabled>-- Elija un usuario --</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                {/* Paso 2: Asignación de Permisos (Lista de Empresas) */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <IconBuilding className="w-5 h-5 mr-2 text-gray-600"/>
                        2. Asignar Empresas
                    </h2>
                    
                    {!selectedUserId ? (
                        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                            Selecciona un usuario en el paso 1 para cargar y modificar sus permisos.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-2">
                            {companies.map(company => (
                                <div
                                    key={company.id}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                        isAssigned(company.id)
                                            ? 'bg-indigo-50 border-indigo-500 shadow-md transform scale-[1.02]'
                                            : 'bg-white border-gray-200 hover:border-indigo-300'
                                    }`}
                                    onClick={() => handleCompanyToggle(company.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-700">
                                            {company.name}
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={isAssigned(company.id)}
                                            readOnly
                                            className={`h-5 w-5 rounded transition-all duration-200 focus:ring-indigo-500 ${
                                                isAssigned(company.id) ? 'text-indigo-600 border-indigo-500' : 'text-gray-400 border-gray-300'
                                            }`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Paso 3: Mensaje de estado y Botón de Guardar */}
                <StatusDisplay message={statusMessage} />

                <div className="pt-6 border-t mt-8">
                    <button
                        onClick={handleSavePermissions}
                        disabled={!selectedUserId}
                        className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg transition duration-200 ease-in-out ${
                            selectedUserId
                                ? 'text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transform hover:scale-[1.01]'
                                : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                        }`}
                    >
                        <IconSave className="w-5 h-5 mr-3" />
                        Guardar Cambios de Permisos
                    </button>
                    <p className="mt-3 text-center text-sm text-gray-500">
                        Total de empresas asignadas: <span className="font-semibold text-indigo-600">{assignedCompanyIds.length}</span>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AdminPermissionsManager;