import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw, Save, Loader, AlertTriangle, CheckCircle, User, Briefcase, ChevronRight } from 'lucide-react';

// Carga Tailwind CSS desde CDN para asegurar los estilos
// (Esta etiqueta de script solo es necesaria si estás ejecutando en un entorno que no tiene Tailwind configurado)
// Nota: En un entorno React normal (CRA/Vite/Next), Tailwind ya estaría configurado.
// Para este ejercicio se asume su disponibilidad.

// URL base de la API (ajusta según la configuración de tu Next.js)
const API_BASE_PATH = '/api/admin';

// ======================================================================
// COMPONENTE: UserPermissionsManager (Contiene toda la Lógica y UI)
// Se define como el componente principal exportado por defecto.
// ======================================================================
const UserPermissionsManager = () => {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // Usuario actualmente seleccionado
  const [currentPermissions, setCurrentPermissions] = useState([]); // Array de IDs de empresas permitidas
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // {text, type: 'success' | 'error' | 'info'}

  // --- Funciones de Fetching ---

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_PATH}/users`);
      if (!res.ok) throw new Error('Error al obtener la lista de usuarios');
      const data = await res.json();
      
      setUsers(data);
    } catch (error) {
      // Usar console.error y mostrar mensaje en UI en lugar de alert()
      console.error('Error fetching users:', error);
      setMessage({ text: `Error al cargar usuarios: ${error.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_PATH}/companies`);
      if (!res.ok) throw new Error('Error al obtener la lista de empresas');
      const data = await res.json();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setMessage({ text: `Error al cargar empresas: ${error.message}`, type: 'error' });
    }
  }, []);

  // Carga inicial de datos al montar el componente
  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, [fetchUsers, fetchCompanies]);

  // --- Lógica de Permisos ---

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    // Inicializa los permisos actuales con los que ya tiene el usuario
    setCurrentPermissions(user.permissions || []); 
    setMessage({ text: '', type: '' });
  };

  const handlePermissionChange = (companyId) => {
    // Asegura que el ID sea numérico
    const id = parseInt(companyId, 10);
    setCurrentPermissions(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id) // Quitar permiso si ya existe
        : [...prev, id]             // Añadir permiso si no existe
    );
  };
  
  // Guardar los cambios en el servidor (Next.js API Route)
  const handleSavePermissions = async () => {
    if (!selectedUser) {
      setMessage({ text: 'Por favor, selecciona un usuario primero.', type: 'info' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: 'Guardando permisos...', type: 'info' });

    try {
      // Simulación de Exponential Backoff para manejo de errores de red (opcional pero buena práctica)
      let response = null;
      let lastError = null;
      const maxRetries = 3;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          response = await fetch(`${API_BASE_PATH}/permissions/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: selectedUser.id,
              permissions: currentPermissions,
            }),
          });
          
          if (response.ok) {
            break; // Salir si es exitoso
          }
          
          const errorBody = await response.json();
          lastError = new Error(errorBody.message || `Error del servidor (Status: ${response.status})`);

          // Si falla, esperar un momento antes de reintentar (Exponencial backoff)
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          }
        } catch (fetchError) {
          lastError = fetchError;
          if (attempt < maxRetries - 1) {
             await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          }
        }
      }

      if (!response || !response.ok) {
        throw lastError || new Error('Fallo la conexión o la actualización después de varios intentos.');
      }
      
      // Actualizar el estado local de los usuarios con los nuevos permisos
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === selectedUser.id 
          ? { ...u, permissions: currentPermissions } 
          : u
      ));
      
      // Actualizar el usuario seleccionado
      setSelectedUser(prev => ({...prev, permissions: currentPermissions}))

      setMessage({ text: '¡Permisos guardados con éxito!', type: 'success' });
    } catch (error) {
      console.error('Error saving permissions:', error);
      setMessage({ text: `Error al guardar: ${error.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Componentes Anidados (Renderizado) ---
  
  // Lista de usuarios a la izquierda
  const UserList = () => (
    <div className="md:w-1/3 w-full border-r border-gray-200 p-4 bg-gray-50 rounded-l-xl overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          <User className="inline h-5 w-5 mr-2 text-indigo-600" />
          Usuarios ({users.length})
        </h2>
        <button 
          onClick={fetchUsers} 
          className="p-2 text-indigo-600 hover:text-indigo-800 transition duration-150"
          title="Recargar Usuarios"
          disabled={isLoading}
        >
          <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        {isLoading && users.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Cargando...</div>
        ) : users.length === 0 ? (
            <p className="text-sm text-gray-500">No hay usuarios cargados. Revisa tu API.</p>
        ) : (
            users.map(user => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                // Estilos condicionales para el usuario seleccionado
                className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition duration-200 ease-in-out shadow-sm
                  ${selectedUser?.id === user.id 
                    ? 'bg-indigo-600 text-white shadow-lg transform scale-[1.01]' 
                    : 'bg-white hover:bg-indigo-50 border border-gray-100'
                  }`}
              >
                <div className="truncate">
                  <p className={`font-semibold ${selectedUser?.id === user.id ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                  <p className={`text-xs ${selectedUser?.id === user.id ? 'text-indigo-200' : 'text-gray-500'}`}>{user.email}</p>
                </div>
                {selectedUser?.id === user.id && <ChevronRight className="h-4 w-4" />}
              </div>
            ))
        )}
      </div>
    </div>
  );

  // Editor de permisos a la derecha
  const PermissionsEditor = () => (
    <div className="md:w-2/3 w-full p-6">
      {selectedUser ? (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Briefcase className="inline h-6 w-6 mr-3 text-emerald-600" />
            Permisos para: <span className="text-indigo-600 ml-2">{selectedUser.name}</span>
          </h2>
          
          {/* Contenedor con scroll para la lista de empresas */}
          <div className="h-[40vh] overflow-y-auto pr-2 mb-6">
            <div className="space-y-3">
              {companies.length === 0 && !isLoading ? (
                  <p className="text-lg text-gray-500">No hay empresas para asignar permisos.</p>
              ) : (
                  companies.map(company => (
                    <label 
                      key={company.id} 
                      className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-indigo-400 transition duration-150 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={currentPermissions.includes(company.id)}
                        onChange={() => handlePermissionChange(company.id)}
                        className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition duration-150"
                        disabled={isLoading}
                      />
                      <span className="text-gray-800 font-medium">{company.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">RUC: {company.ruc || 'N/A'}</span>
                    </label>
                  ))
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSavePermissions}
              disabled={isLoading || !selectedUser}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold text-lg transition duration-300 ease-in-out shadow-lg
                ${isLoading 
                  ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-xl active:bg-emerald-700'
                }`}
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-3" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-3" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        // Estado inicial cuando no hay usuario seleccionado
        <div className="flex items-center justify-center h-full text-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-xl text-gray-600 font-medium">
            Selecciona un usuario de la lista de la izquierda para comenzar a gestionar sus permisos.
          </p>
        </div>
      )}
    </div>
  );
  
  // Componente de Mensajes (Alertas flotantes)
  const Message = () => {
    if (!message.text) return null;

    const baseClasses = "flex items-center p-4 rounded-xl font-medium shadow-md transition-all duration-300";
    let icon, colorClasses;

    switch (message.type) {
      case 'success':
        icon = <CheckCircle className="h-6 w-6 mr-3" />;
        colorClasses = "bg-green-100 text-green-800 border-l-4 border-green-500";
        break;
      case 'error':
        icon = <AlertTriangle className="h-6 w-6 mr-3" />;
        colorClasses = "bg-red-100 text-red-800 border-l-4 border-red-500";
        break;
      case 'info':
      default:
        icon = <Loader className="h-6 w-6 mr-3 animate-pulse" />;
        colorClasses = "bg-blue-100 text-blue-800 border-l-4 border-blue-500";
        break;
    }

    return (
      <div className={`absolute bottom-5 right-5 z-50 ${baseClasses} ${colorClasses}`}>
        {icon}
        <span>{message.text}</span>
      </div>
    );
  };

  // Renderizado final del manager
  return (
    <div className="flex flex-col h-[80vh] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
      <div className="flex flex-col md:flex-row flex-grow">
        <UserList />
        <PermissionsEditor />
      </div>
      <Message />
    </div>
  );
};

// ======================================================================
// COMPONENTE PRINCIPAL (App) que envuelve el Manager
// ======================================================================
const App = () => {
  return (
    // Contenedor principal para el diseño y el fondo
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Panel de Control de Permisos
        </h1>
        <p className="text-xl text-gray-600 mt-2">
          Asignación de acceso a empresas por usuario
        </p>
      </header>
      {/* Contenedor centralizado para el manager */}
      <div className="max-w-6xl mx-auto">
        <UserPermissionsManager />
      </div>
      <footer className="mt-10 text-center text-sm text-gray-500">
        <p>Asegúrate de que tus Next.js API Routes (`/api/admin/users`, `/api/admin/companies`, `/api/admin/permissions/update`) estén configuradas correctamente con Prisma y MySQL.</p>
      </footer>
    </div>
  );
};

export default App;