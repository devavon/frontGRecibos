import React, { useState, useMemo, ChangeEvent } from 'react';
import { Search, User, Briefcase, ChevronRight, CheckCircle, XCircle } from 'lucide-react';

// ===================================================================
// INTERFACES (DEFINICIÓN DE TIPOS)
// ESTO ES LO QUE SOLUCIONA LOS ERRORES DE SUBRAYADO ROJO EN 'user' y 'users'
// ===================================================================
interface User {
  id: string; // La ID del usuario
  name: string; // El nombre del usuario
  email: string; // El correo del usuario
}

interface Company {
  id: string; // La ID de la empresa
  name: string; // El nombre de la empresa
}

// Props esperadas por el componente
interface AdminPermissionManagerProps {
  isAdmin: boolean;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  onAssignCompany: (company: Company) => void;
  onRemoveCompany: (companyId: string) => void;
  users: User[]; // AHORA TypeScript sabe que esto es un array de objetos User
  availableCompanies: Company[]; 
}

const AdminPermissionManager: React.FC<AdminPermissionManagerProps> = ({
  isAdmin,
  selectedUser,
  setSelectedUser,
  onAssignCompany,
  // Usar '=[]' como valor por defecto ayuda a que no haya errores si los datos tardan en cargar.
  users = [], 
  availableCompanies = [],
}) => {
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // 1. Filtrar usuarios basados en el término de búsqueda
  const filteredUsers = useMemo(() => {
    // Si no hay término de búsqueda, devuelve todos los usuarios
    if (!userSearchTerm) return users; 
    
    const lowerCaseSearch = userSearchTerm.toLowerCase();
    
    // Aquí, 'user' ya está correctamente tipado y no da error.
    return users.filter(user =>
      user.name.toLowerCase().includes(lowerCaseSearch) ||
      user.email.toLowerCase().includes(lowerCaseSearch)
    );
  }, [users, userSearchTerm]);

  // 2. Filtrar empresas disponibles para asignar
  const filteredAvailableCompanies = useMemo(() => {
    const lowerCaseSearch = companySearchTerm.toLowerCase();
    
    return availableCompanies.filter(company =>
      company.name.toLowerCase().includes(lowerCaseSearch)
    );
  }, [availableCompanies, companySearchTerm]);

  // Manejar la selección de usuario
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setCompanySearchTerm(''); 
  };

  if (!isAdmin) {
    return (
      <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-2 flex items-center">
          <XCircle className="w-5 h-5 mr-2" />
          Acceso Restringido
        </h2>
        <p>Solo los administradores pueden gestionar los permisos de los usuarios.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-2xl h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
        Gestión de Permisos de Acceso a Empresas
      </h2>

      {/* 1. SELECCIÓN DE USUARIO */}
      <div className="mb-8 border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-semibold text-indigo-700 mb-3 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Seleccionar Usuario
        </h3>
        
        {/* Barra de Búsqueda de Usuarios */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar usuario por nombre o correo..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            value={userSearchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUserSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* Lista de Usuarios */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <button
                key={user.id}
                className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition duration-150 ease-in-out 
                  ${selectedUser?.id === user.id 
                    ? 'bg-indigo-600 text-white shadow-md scale-[1.01]' 
                    : 'bg-white hover:bg-indigo-50 border border-gray-200 text-gray-800'
                  }`}
                onClick={() => handleUserSelect(user)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className={`text-sm ${selectedUser?.id === user.id ? 'text-indigo-200' : 'text-gray-500'}`}>{user.email}</span>
                </div>
                {selectedUser?.id === user.id && <CheckCircle className="w-5 h-5" />}
              </button>
            ))
          ) : (
            <div className="text-gray-500 p-3 text-center bg-white rounded-lg border border-dashed border-gray-300">
              <p>No hay usuarios disponibles para asignar permisos.</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. ASIGNACIÓN DE EMPRESAS */}
      <div className="flex-grow border border-gray-200 rounded-lg p-4 bg-white">
        {selectedUser ? (
          <>
            <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Asignar Empresas a: <span className="text-indigo-600 ml-1">{selectedUser.name}</span>
            </h3>

            {/* Barra de Búsqueda de Empresas */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Buscar empresas disponibles..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                value={companySearchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCompanySearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Lista de Empresas Disponibles */}
            <div className="max-h-72 overflow-y-auto space-y-2">
              {filteredAvailableCompanies.length > 0 ? (
                filteredAvailableCompanies.map(company => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <span className="font-medium text-gray-700">{company.name}</span>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-1 px-3 rounded-full transition duration-150 ease-in-out shadow-md hover:shadow-lg disabled:opacity-50"
                      onClick={() => {
                        setIsAssigning(true);
                        onAssignCompany(company);
                        setTimeout(() => setIsAssigning(false), 500); // Simulación de carga
                      }}
                      disabled={isAssigning}
                    >
                      {isAssigning ? 'Asignando...' : 'Asignar'}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 p-3 text-center border border-dashed rounded-lg">No se encontraron empresas disponibles para asignar.</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center p-12 text-gray-500">
            <ChevronRight className="w-10 h-10 mx-auto mb-3 text-gray-400" />
            <p className="font-medium">
              Por favor, selecciona un usuario arriba para comenzar a asignar permisos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPermissionManager;