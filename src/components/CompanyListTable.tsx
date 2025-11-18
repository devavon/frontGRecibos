import React, { useState, useEffect, useMemo } from 'react';

// Interfaz para representar los datos que vienen de tu API de MySQL
// Adapta los nombres de las propiedades (id, name, industry, etc.) para que coincidan con tu base de datos real.
interface Company {
  id: number;
  name: string;
  industry: string;
  employee_count: number;
  annual_revenue: number;
}

// 🚨🚨🚨 IMPORTANTE: REEMPLAZA ESTA URL 🚨🚨🚨
// ESTA DEBE SER LA URL REAL DE TU ENDPOINT DE BACKEND (ej: 'http://localhost:3000/api/companies')
// NOTA: Estoy usando una API de ejemplo (JSONPlaceholder) para simular la estructura de datos.
const API_URL = 'https://jsonplaceholder.typicode.com/users'; 

/**
 * Formatea un valor numérico con separador de miles.
 * @param value El número a formatear.
 */
const formatNumber = (value: number): string => {
  // Usa 'es-CO' para separadores de miles con punto y decimales con coma.
  return value.toLocaleString('es-CO');
};

/**
 * Formatea el ingreso como moneda (ejemplo: $12.345.678).
 * @param value El monto de ingresos.
 */
const formatRevenue = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0, // No mostrar decimales para ingresos grandes
  }).format(value);
};

export const CompanyListTable: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetching de la API
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Fallo al cargar datos: ${response.statusText} (${response.status})`);
      }

      const rawData: any[] = await response.json();

      // 2. Mapeo y Transformación de Datos
      // ESTE MAPEO ES CRUCIAL Y DEBE ADAPTARSE A TU API REAL.
      const transformedData: Company[] = rawData.slice(0, 10).map((item, index) => ({ // Solo tomamos 10 elementos por simplicidad
        id: item.id,
        // Adaptación: Usar el campo 'name' si existe, o simular
        name: item.company?.name || `Compañía Test ${item.id}`,
        // Adaptación: Reemplaza con item.industry de tu API real
        industry: item.id % 3 === 0 ? 'Tecnología' : (item.id % 3 === 1 ? 'Manufactura' : 'Servicios'),
        employee_count: (item.id + 1) * 100 + (index * 50),
        annual_revenue: (item.id + 1) * 1000000 + (index * 500000),
      }));

      setCompanies(transformedData);

    } catch (e: any) {
      console.error('Error fetching data:', e);
      setError(`Error de conexión o datos. Mensaje: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Se ejecuta solo una vez al montar el componente
  useEffect(() => {
    fetchCompanyData();
  }, []);

  // Usamos useMemo para ordenar la lista solo cuando cambian los datos.
  const sortedCompanies = useMemo(() => {
    return [...companies].sort((a, b) => a.name.localeCompare(b.name));
  }, [companies]);


  // --- RENDERIZADO ---
  return (
    <div className="bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl p-6 md:p-10 border border-gray-100">
        <header className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2 border-b-4 border-indigo-500 pb-2">
            Gestión de Compañías
            </h1>
            <p className="text-sm text-gray-500">
            Tabla de datos de compañías obtenida de tu API REST.
            </p>
        </header>


        {/* Indicador de carga */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 text-indigo-600 bg-indigo-50 rounded-xl my-6">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="mt-4 text-lg font-medium">Cargando datos de compañías desde el servidor...</span>
          </div>
        )}

        {/* Mensaje de error */}
        {error && !loading && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative mb-8 shadow-md" role="alert">
            <strong className="font-bold">Error de Conexión o API:</strong>
            <span className="block sm:inline ml-2">{error}</span>
            <p className="text-sm mt-2 font-medium">
              Por favor, verifica la URL de la API y el estado de tu servidor backend.
            </p>
          </div>
        )}

        {/* Contenido principal: Tabla de Compañías */}
        {sortedCompanies.length > 0 && !loading && (
          <>
            <div className="overflow-x-auto shadow-xl rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-600">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider rounded-tl-xl">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Industria
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider hidden sm:table-cell">
                      Empleados
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider rounded-tr-xl">
                      Ingreso Anual (USD)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {sortedCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-indigo-50/50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {company.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-100 text-blue-800">
                          {company.industry}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right hidden sm:table-cell">
                        {formatNumber(company.employee_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 font-bold text-right">
                        {formatRevenue(company.annual_revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 font-medium text-center shadow-inner">
              Mostrando un total de **{companies.length}** compañías cargadas.
            </div>
          </>
        )}

        {/* Mensaje de no datos */}
        {companies.length === 0 && !loading && !error && (
          <div className="text-center p-12 bg-yellow-50 border border-yellow-200 rounded-xl shadow-md my-6">
            <p className="text-2xl text-yellow-800 font-bold">
              ¡Datos no encontrados!
            </p>
            <p className="text-md text-yellow-600 mt-3">
              La API cargó correctamente, pero devolvió una lista vacía.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};