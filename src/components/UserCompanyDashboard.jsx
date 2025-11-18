import React, { useState, useEffect } from 'react';
import { Building, Lock, User, RefreshCw, Layers } from 'lucide-react';

// Simulación de todas las empresas disponibles en el sistema (BACKEND MOCK)
const ALL_COMPANIES_MOCK = [
    { id: 101, name: "Alpha Corp", city: "New York", status: "Active" },
    { id: 102, name: "Beta Solutions", city: "Chicago", status: "Active" },
    { id: 103, name: "Gamma Ltd", city: "London", status: "Inactive" },
    { id: 104, name: "Delta Global", city: "Paris", status: "Active" },
    { id: 105, name: "Epsilon Ventures", city: "Tokyo", status: "Active" },
];

// Simulación de la base de datos de permisos (UserCompany table)
// Esto simula lo que el Admin asignaría con el componente anterior.
const PERMISSIONS_MOCK = {
    // Usuario 1 (Admin/Testing) tiene acceso a 101, 103, 105
    1: [101, 103, 105],
    // Usuario 2 (Ejemplo de usuario normal) tiene acceso a 102, 104
    2: [102, 104], 
};

/**
 * Simulación de la llamada API protegida (donde el Middleware RBAC actúa).
 * Esto imita la lógica que estaría en 'api_middleware_with_rbac.js' en el servidor.
 * * @param {number} userId - El ID del usuario autenticado
 * @returns {Promise<Array<Object>>} - Solo las empresas a las que tiene acceso.
 */
const fetchAuthorizedCompanies = (userId) => {
    return new Promise(resolve => {
        setTimeout(() => {
            // 1. EL SERVIDOR identifica el usuario (Middleware)
            const authorizedIds = PERMISSIONS_MOCK[userId] || [];

            // 2. EL SERVIDOR filtra la base de datos (RBAC Enforcement)
            const filteredCompanies = ALL_COMPANIES_MOCK.filter(company => 
                authorizedIds.includes(company.id)
            );
            
            // 3. EL SERVIDOR devuelve solo los datos filtrados
            resolve(filteredCompanies);
        }, 1000); // Simula latencia de red
    });
};

const UserCompanyDashboard = () => {
    // Simula el usuario actualmente logueado. 
    // Puedes cambiar este ID para probar diferentes permisos: 1, 2, o 3 (sin permisos)
    const [currentUserId, setCurrentUserId] = useState(1); // Default: Usuario Admin/Testing
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadCompanies = async (userId) => {
        setIsLoading(true);
        setCompanies([]);
        try {
            const data = await fetchAuthorizedCompanies(userId);
            setCompanies(data);
        } catch (error) {
            console.error("Error al cargar empresas filtradas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Carga inicial de datos
    useEffect(() => {
        loadCompanies(currentUserId);
    }, [currentUserId]);

    // Opciones de prueba para el selector
    const testUsers = [
        { id: 1, name: "Admin (Acceso: 101, 103, 105)" },
        { id: 2, name: "Usuario Normal (Acceso: 102, 104)" },
        { id: 3, name: "Usuario Nuevo (Acceso: Ninguno)" },
    ];

    // Estilo para el header fijo
    const headerStyle = "bg-indigo-600 text-white p-3 font-semibold text-left";

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
            <script src="https://cdn.tailwindcss.com"></script>
            <div className="max-w-4xl mx-auto">
                
                <h1 className="text-3xl font-extrabold text-gray-800 mb-2 flex items-center">
                    <Lock className="w-7 h-7 mr-3 text-indigo-600" />
                    Panel de Usuario (Vista Filtrada por RBAC)
                </h1>
                <p className="text-gray-600 mb-6 border-b pb-4">
                    Este panel simula una consulta protegida por la lógica de **backend**. Solo se muestran las empresas 
                    asignadas al usuario actual, gracias al filtro aplicado por el middleware.
                </p>

                {/* Selector de Usuario de Prueba */}
                <div className="mb-6 p-4 bg-white rounded-xl shadow-lg border border-indigo-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="inline w-4 h-4 mr-1 text-indigo-500" /> 
                        Simular Usuario Actual (Cambia para probar los permisos)
                    </label>
                    <select
                        value={currentUserId}
                        onChange={(e) => setCurrentUserId(parseInt(e.target.value))}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                    >
                        {testUsers.map(user => (
                            <option key={user.id} value={user.id}>
                                ID {user.id} - {user.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Mostrar datos filtrados */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <h2 className="text-xl font-semibold p-4 bg-indigo-50 text-indigo-800 flex items-center">
                        <Building className="w-5 h-5 mr-2" /> 
                        Empresas Autorizadas para el Usuario ID {currentUserId}
                    </h2>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-40 text-indigo-500">
                            <RefreshCw className="w-8 h-8 animate-spin mr-2" />
                            Cargando datos protegidos...
                        </div>
                    ) : companies.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className={headerStyle + " rounded-tl-xl"}>ID</th>
                                        <th className={headerStyle}>Nombre</th>
                                        <th className={headerStyle}>Ciudad</th>
                                        <th className={headerStyle + " rounded-tr-xl"}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {companies.map((company, index) => (
                                        <tr key={company.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{company.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{company.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.city}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${company.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {company.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-500 italic">
                            <Layers className="w-10 h-10 mx-auto mb-2 text-indigo-300" />
                            <p>¡Acceso denegado o no hay empresas asignadas!</p>
                            <p className="text-xs mt-1">Si eres el Usuario 3, no tienes permisos en el mock de la base de datos.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserCompanyDashboard;