"use client";

import { useState, useEffect, useCallback, ChangeEvent, SVGProps } from 'react'; 

const useParams = () => ({ id: '1' }); 
const useRouter = () => ({ push: (path: string) => console.log('NAVIGATING TO:', path) }); 

type IconProps = SVGProps<SVGSVGElement>;

const CheckIcon = (props: IconProps) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const ArrowPathIcon = (props: IconProps) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.181A1.652 1.652 0 0110.207 21h6.082a2.008 2.008 0 001.523-2.984l-2.922-4.22m-2.5 3.09h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.181A1.652 1.652 0 0110.207 21h6.082a2.008 2.008 0 001.523-2.984l-2.922-4.22m-2.5 3.09h4.992v-.001" />
  </svg>
);

const useAuth = () => {
  return { 
    user: { 
        roleId: 3, 
        name: "Admin Test", 
        email: "test@example.com" 
    }, 
    token: "dummy-token-for-test",
    loading: false 
  };
};

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

// --- INTERFACES/TIPOS ---
interface UserData {
    id: number;
    email: string;
    name: string;
    roleId: number;
    userCompanies: { companyId: number }[];
}

interface Role {
    id: number;
    name: string;
}

interface Company {
    id: number;
    name: string;
}

// Componente para mostrar mensajes (éxito/error)
const StatusMessage = ({ message, isError }: { message: string, isError: boolean }) => (
  <div className={`p-4 rounded-md mb-4 ${isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
    {message}
  </div>
);

// Componente principal de la página de edición
export default function AdminEditUserPage() {
  // Ahora usamos la función simulada useParams, que retorna { id: '1' } por defecto
  const { id: userIdParam } = useParams();
  const id = typeof userIdParam === 'string' ? userIdParam : null;

  // Ahora usamos la función simulada useRouter
  const router = useRouter();
  const { user: currentUser, token } = useAuth();
  
  // Estados de datos
  const [userData, setUserData] = useState<UserData | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  
  // Estados de UI/Control
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados del formulario
  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<number>>(new Set());

  // Función para cargar los datos
  const fetchData = useCallback(async () => {
    // Si el token o el ID es nulo, detenemos la ejecución (CORRECCIÓN 2)
    if (!token || !id) {
        if (!token) setError("Error de autenticación: Token no encontrado.");
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al cargar datos: ${response.statusText}`);
      }

      const { user, roles, companies } = await response.json();
      setUserData(user);
      setRoles(roles);
      setAllCompanies(companies);

      // Inicializar estados
      setSelectedRoleId(user.roleId);
      
      // La corrección de tipado de la versión anterior elimina el error en esta línea.
      const initialCompanyIds: Set<number> = new Set(
          user.userCompanies.map((uc: { companyId: number }) => uc.companyId)
      );
      setSelectedCompanyIds(initialCompanyIds);

    } catch (err) {
      console.error("Fallo en fetchData:", err);
      setError(err instanceof Error ? err.message : "Error desconocido al intentar obtener los datos.");
    } finally {
      setIsLoading(false);
    }
  }, [id, token]); 

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Maneja la selección/deselección de compañías
  const handleCompanyToggle = (companyId: number) => {
    setSelectedCompanyIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id || isSaving) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const dataToSend = {
      roleId: selectedRoleId,
      companyIds: Array.from(selectedCompanyIds),
    };

    try {
      const response = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al guardar: ${response.statusText}`);
      }

      const result = await response.json();
      setSuccess(result.message || 'Asignaciones actualizadas con éxito.');
      
    } catch (err) {
      console.error("Fallo en handleSubmit:", err);
      setError(err instanceof Error ? err.message : "Error desconocido al intentar actualizar el usuario.");
    } finally {
      setIsSaving(false);
    }
  };


  // --- Renderizado y Verificaciones ---

  // Gracias a la corrección de useAuth, currentUser siempre existe aquí, 
  // pero verificamos su roleId.
  if (currentUser.roleId !== 3) {
    return (
      <div className="p-8 text-center bg-red-50 border-l-4 border-red-500 text-red-700">
        <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
        <p>Solo los Administradores Globales tienen permiso para editar usuarios.</p>
      </div>
    );
  }
  
  // Si isLoading es verdadero (al inicio) mostramos el spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ArrowPathIcon className="w-10 h-10 animate-spin text-indigo-600" />
        <span className="ml-3 text-indigo-600 font-semibold">Cargando datos...</span>
      </div>
    );
  }

  // Si hay error y no se cargó el usuario, mostramos el error y el botón de volver.
  if (error && !userData) {
    return (
      <div className="p-8 text-center bg-red-100 border-l-4 border-red-500 text-red-700">
        <h1 className="text-2xl font-bold mb-2">Error de Carga</h1>
        <p>{error}</p>
        <button 
            onClick={() => router.push('/admin/users')} 
            className="mt-4 px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
            Volver al Listado
        </button>
      </div>
    );
  }
  
  if (!userData) return null; 

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-6 sm:p-8">
        
        <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-3xl font-extrabold text-gray-900">
                Editar Asignaciones
            </h1>
            <button 
                onClick={() => router.push('/admin/users')} 
                className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
                ← Volver
            </button>
        </div>

        {/* Información del usuario a editar */}
        <div className="mb-8 p-4 border rounded-lg bg-indigo-50 border-indigo-200">
            <h2 className="text-xl font-semibold text-indigo-800 mb-2">{userData.name}</h2>
            <p className="text-indigo-600 text-sm">{userData.email}</p>
        </div>

        {success && <StatusMessage message={success} isError={false} />}
        {error && <StatusMessage message={error} isError={true} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECCIÓN 1: ASIGNACIÓN DE ROL */}
          <div>
            <label htmlFor="role" className="block text-lg font-medium text-gray-700 mb-2">
              Rol del Usuario
            </label>
            <select
              id="role"
              name="role"
              value={selectedRoleId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedRoleId(parseInt(e.target.value))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
              required
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
                El rol determina el nivel de acceso global del usuario.
            </p>
          </div>

          {/* SECCIÓN 2: ASIGNACIÓN DE COMPAÑÍAS */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-3">
              Compañías Asignadas (Acceso Específico)
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto p-3 border rounded-md bg-gray-50">
              {allCompanies.map((company) => (
                <div key={company.id} className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id={`company-${company.id}`}
                      name={`company-${company.id}`}
                      type="checkbox"
                      checked={selectedCompanyIds.has(company.id)}
                      onChange={() => handleCompanyToggle(company.id)}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label 
                        htmlFor={`company-${company.id}`} 
                        className="font-medium text-gray-700 cursor-pointer"
                    >
                        {company.name}
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">
                Selecciona las compañías a las que este usuario debe tener acceso.
            </p>
          </div>

          {/* Botón de Guardar */}
          <div className="pt-5">
            <button
              type="submit"
              disabled={isSaving}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white transition-colors 
                ${isSaving 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`
              }
            >
              {isSaving ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5 mr-2" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}