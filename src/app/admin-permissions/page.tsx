"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search } from 'lucide-react'; // Usaremos un icono de búsqueda

// --- INTERFACES GLOBALES ---

// Define la interfaz de Usuario (User)
interface User {
  id: string;
  name: string;
  email: string;
  // Propiedad para almacenar las IDs de las empresas asignadas
  assignedCompanyIds: number[];
}

// Define la interfaz de Empresa (Company)
interface Company {
  id: number;
  name: string;
  // Cualquier otra propiedad relevante de la empresa
}

// Define la interfaz de Asignación de Permiso (Permission)
/* interface Permission {
  userId: string;
  companyId: number;
} */


// --- 1. COMPONENTE UserCompanyDashboard (Columna Derecha) ---

interface UserCompanyDashboardProps {
  selectedUser: User | null;
  assignedCompanies: Company[];
  onRemoveCompany: (companyId: number) => void;
  isLoading: boolean;
}

const UserCompanyDashboard: React.FC<UserCompanyDashboardProps> = ({
  selectedUser,
  assignedCompanies,
  onRemoveCompany,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 min-h-64 flex items-center justify-center">
        <p className="text-gray-500">Cargando permisos...</p>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 min-h-64">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Empresas Asignadas
        </h3>
        <p className="text-sm text-gray-500">
          Por favor, selecciona un usuario de la lista de la izquierda para ver y gestionar sus permisos.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl shadow-lg bg-white border border-gray-100">
      <h3 className="text-xl font-semibold text-indigo-700 mb-4 border-b pb-2">
        Permisos de {selectedUser.name}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Total de Empresas Asignadas: <span className="font-bold text-indigo-600">{assignedCompanies.length}</span>
      </p>

      {assignedCompanies.length === 0 ? (
        <div className="text-center p-8 bg-indigo-50 rounded-lg">
          <p className="text-md text-indigo-700 font-medium">
            ¡Ninguna empresa asignada aún!
          </p>
          <p className="text-sm text-indigo-500 mt-1">
            Usa el panel de la izquierda para agregar la primera.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {assignedCompanies.map((company) => (
            <div
              key={company.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-150"
            >
              <span className="font-medium text-gray-800 text-sm">
                {company.name}
              </span>
              <button
                onClick={() => onRemoveCompany(company.id)}
                className="text-red-500 hover:text-red-700 font-semibold text-xs py-1 px-3 bg-red-100 rounded-full transition duration-150"
                aria-label={`Remover permiso para ${company.name}`}
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// --- 2. COMPONENTE AdminManagerComponent (Columna Izquierda) ---

interface AdminManagerComponentProps {
  users: User[];
  companies: Company[];
  selectedUser: User | null;
  onUserSelect: (user: User) => void;
  onAssignCompany: (companyId: number) => void;
  isLoading: boolean;
  error: string | null;
}

const AdminManagerComponent: React.FC<AdminManagerComponentProps> = ({
  users,
  companies,
  selectedUser,
  onUserSelect,
  onAssignCompany,
  isLoading,
  error,
}) => {
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');

  // 1. Filtrar usuarios basados en el término de búsqueda
  const filteredUsers = useMemo(() => {
    if (!userSearchTerm) return users;
    const lowerCaseSearch = userSearchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerCaseSearch) ||
        user.email.toLowerCase().includes(lowerCaseSearch) ||
        user.id.toLowerCase().includes(lowerCaseSearch)
    );
  }, [users, userSearchTerm]);

  // 2. Filtrar y excluir empresas ya asignadas al usuario seleccionado
  const availableCompanies = useMemo(() => {
    if (!selectedUser) return [];

    // IDs de las empresas ya asignadas
    const assignedIds = new Set(selectedUser.assignedCompanyIds);

    // Filtrar empresas que no están asignadas
    let available = companies.filter((company) => !assignedIds.has(company.id));

    // Aplicar filtro de búsqueda si existe
    if (companySearchTerm) {
      const lowerCaseSearch = companySearchTerm.toLowerCase();
      available = available.filter((company) =>
        company.name.toLowerCase().includes(lowerCaseSearch)
      );
    }

    return available;
  }, [companies, selectedUser, companySearchTerm]);

  // Manejar estados de carga y error iniciales
  if (isLoading) {
    return (
      <div className="p-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center min-h-96">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-indigo-700 font-medium">Cargando datos iniciales...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-100 border border-red-400 text-red-700 min-h-64">
        <h3 className="font-bold mb-2">Error Crítico</h3>
        <p>Hubo un error al cargar los datos de usuarios o empresas: {error}</p>
        <p className="text-sm mt-2">Asegúrate de tener los permisos de administrador suficientes.</p>
      </div>
    );
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Columna Izquierda: Selección de Usuario */}
      <div className="p-6 rounded-xl shadow-lg bg-white border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          1. Seleccionar Usuario
        </h2>

        {/* Barra de Búsqueda de Usuarios */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuario por nombre o email..."
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Lista de Usuarios */}
        {filteredUsers.length === 0 ? (
          <div className="text-center p-4 text-gray-500 bg-gray-50 rounded-lg">
            No se encontraron usuarios.
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserSelect(user)}
                className={`w-full text-left p-3 rounded-lg transition duration-150 ${
                  selectedUser?.id === user.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-800 hover:bg-indigo-100 hover:text-indigo-800'
                }`}
              >
                <p className="font-semibold truncate">{user.name}</p>
                <p className={`text-xs truncate ${selectedUser?.id === user.id ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {user.email} (ID: {user.id})
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Columna Derecha: Asignación de Empresas */}
      <div className="p-6 rounded-xl shadow-lg bg-white border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          2. Asignar Empresas
        </h2>

        {selectedUser ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Asignando a: <span className="font-bold text-indigo-700">{selectedUser.name}</span>
            </p>

            {/* Barra de Búsqueda de Empresas */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar empresa disponible..."
                value={companySearchTerm}
                onChange={(e) => setCompanySearchTerm(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Lista de Empresas Disponibles */}
            {availableCompanies.length === 0 ? (
              <div className="text-center p-4 text-gray-500 bg-gray-50 rounded-lg">
                {selectedUser.assignedCompanyIds.length === companies.length
                  ? 'Todas las empresas han sido asignadas.'
                  : 'No se encontraron empresas disponibles.'}
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {availableCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg shadow-sm"
                  >
                    <span className="font-medium text-gray-800 text-sm">{company.name}</span>
                    <button
                      onClick={() => onAssignCompany(company.id)}
                      className="text-white font-semibold text-xs py-1 px-3 bg-green-600 hover:bg-green-700 rounded-full transition duration-150 shadow"
                      aria-label={`Asignar ${company.name}`}
                    >
                      Asignar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-md text-gray-700 font-medium">
              Selecciona un usuario para ver las empresas disponibles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- 3. COMPONENTE PRINCIPAL (Page) ---

export default function AdminPermissionsPage() {
  // --- Estados de Datos y UI ---
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
/*   const [assignedPermissions, setAssignedPermissions] = useState<Permission[]>([]);
 */  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 4. FUNCIÓN PARA SIMULAR LA CARGA DE DATOS DESDE LA API (MOCK) ---
  // NOTA: Debes reemplazar esto con tu lógica real de FETCH/AXIOS.
  const fetchData = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      // *** 1. Cargar Usuarios ***
      // Reemplaza esta simulación con tu llamada a la API
      const fetchedUsers: User[] = [
        { id: '1', name: 'Admin User', email: 'admin@example.com', assignedCompanyIds: [1, 3] },
        { id: '2', name: 'Jose Perez', email: 'jose.perez@test.com', assignedCompanyIds: [2] },
        { id: '3', name: 'Maria Lopez', email: 'maria@test.com', assignedCompanyIds: [] },
      ];
      setUsers(fetchedUsers);

      // *** 2. Cargar Empresas ***
      // Reemplaza esta simulación con tu llamada a la API
      const fetchedCompanies: Company[] = [
        { id: 1, name: 'Empresa A S.A.' },
        { id: 2, name: 'Compañía B C.V.' },
        { id: 3, name: 'Holding C Ltda.' },
        { id: 4, name: 'Grupo D Internacional' },
      ];
      setCompanies(fetchedCompanies);

      // *** 3. Cargar Permisos Asignados (opcional, si los manejas globalmente) ***
      // NOTA: Para simplificar, estamos usando 'assignedCompanyIds' en el objeto User.
      // Si usas una tabla de permisos separada, la cargarías aquí:
      // const fetchedPermissions: Permission[] = [...];
      // setAssignedPermissions(fetchedPermissions);
      
      // Si el usuario ya estaba seleccionado, lo refrescamos para reflejar los nuevos datos
      if (selectedUser) {
        const freshUser = fetchedUsers.find(u => u.id === selectedUser.id) || null;
        setSelectedUser(freshUser);
      }
      
    } catch (e) {
      console.error("Error al cargar datos iniciales:", e);
      setError('Ocurrió un error al intentar cargar los datos. Verifique su conexión o permisos de administrador.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser]); // selectedUser como dependencia para refrescar si ya había uno seleccionado

  // --- 5. EFECTO PARA LA CARGA INICIAL ---
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Lógica de Manejo de Permisos ---

  // Obtiene las empresas asignadas al usuario seleccionado
  const assignedCompanies: Company[] = useMemo(() => {
    if (!selectedUser || companies.length === 0) return [];
    
    // Filtra las empresas cuyos IDs están en el array del usuario
    return companies.filter(company => selectedUser.assignedCompanyIds.includes(company.id));
  }, [selectedUser, companies]);


  // Función para manejar la asignación (agregar permiso)
  const handleAssignCompany = useCallback((companyId: number) => {
    if (!selectedUser) return;
    
    // Lógica para llamar a tu API y asignar el permiso (simulado)
    console.log(`API CALL: Asignando empresa ${companyId} al usuario ${selectedUser.id}`);

    // SIMULACIÓN: Actualizar el estado local (idealmente, esto debería venir de una recarga exitosa de la API)
    const updatedUser = {
      ...selectedUser,
      assignedCompanyIds: [...selectedUser.assignedCompanyIds, companyId],
    };

    // Actualizar la lista global de usuarios y el usuario seleccionado
    setUsers(users.map(u => (u.id === selectedUser.id ? updatedUser : u)));
    setSelectedUser(updatedUser);

  }, [selectedUser, users]);

  // Función para manejar la remoción (quitar permiso)
  const handleRemoveCompany = useCallback((companyId: number) => {
    if (!selectedUser) return;

    // Lógica para llamar a tu API y remover el permiso (simulado)
    console.log(`API CALL: Removiendo empresa ${companyId} del usuario ${selectedUser.id}`);

    // SIMULACIÓN: Actualizar el estado local
    const updatedUser = {
      ...selectedUser,
      assignedCompanyIds: selectedUser.assignedCompanyIds.filter(id => id !== companyId),
    };

    // Actualizar la lista global de usuarios y el usuario seleccionado
    setUsers(users.map(u => (u.id === selectedUser.id ? updatedUser : u)));
    setSelectedUser(updatedUser);

  }, [selectedUser, users]);

  // Manejador de selección de usuario
  const handleUserSelect = useCallback((user: User) => {
    setSelectedUser(user);
    // Nota: Aquí podrías añadir una lógica para recargar solo los permisos de ese usuario si fuera necesario
  }, []);

  // --- Renderizado de la Página ---
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
        Gestión de Permisos de Empresas (Admin)
      </h1>

      {/* Mostrar Error Global si no se cargaron los datos iniciales */}
      {error && !isLoading && (
         <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-400 text-red-700">
            <h3 className="font-bold">Error de Carga</h3>
            <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Manager de Permisos (Selección de Usuario y Asignación) */}
        <div className="lg:col-span-2">
          <AdminManagerComponent
            users={users}
            companies={companies}
            selectedUser={selectedUser}
            onUserSelect={handleUserSelect}
            onAssignCompany={handleAssignCompany}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Columna Derecha: Dashboard de Usuario (Permisos Asignados) */}
        <div className="lg:col-span-1">
          <UserCompanyDashboard
            selectedUser={selectedUser}
            assignedCompanies={assignedCompanies}
            onRemoveCompany={handleRemoveCompany}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* DEBUG/ID INFO (Mantenemos la información de ID para referencia) */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
        <p className="font-semibold">Información de la Aplicación</p>
        <p>Usuarios Cargados: {users.length}</p>
        <p>Empresas Cargadas: {companies.length}</p>
        <p>Usuario Seleccionado ID: {selectedUser?.id || 'Ninguno'}</p>
      </div>
    </div>
  );
}