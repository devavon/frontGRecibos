"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";

// --- INTERFACES ---
interface Factura {
  id: number;
  proveedor: string;
  empresa: string;
  fecha: string;
  moneda: string;
  monto: number;
  concepto: string;
  documentoUrl: string | null;
  email: string;
  banco?: string;
  numeroReferencia?: string;
}

interface DatosProps {
  userRole: "admin" | "contador" | "tesoreria";
  userCompanies: string[];
}

interface StatusMessage {
  type: 'success' | 'error' | 'info' | null;
  text: string | null;
}

// --- COMPONENTE PRINCIPAL ---
export function Datos({ userRole, userCompanies }: DatosProps) {
  // Estados
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [filterProveedor, setFilterProveedor] = useState("");
  const [filterEmpresa, setFilterEmpresa] = useState("");
  const [filterBanco, setFilterBanco] = useState("");
  const [filterMoneda, setFilterMoneda] = useState("");
  const [filterNumeroReferencia, setFilterNumeroReferencia] = useState("");
  const [filterFechaDesde, setFilterFechaDesde] = useState("");
  const [filterFechaHasta, setFilterFechaHasta] = useState("");
  const [filterConcepto, setFilterConcepto] = useState("");
  const [filterMontoMin, setFilterMontoMin] = useState<number | ''>('');
  const [filterMontoMax, setFilterMontoMax] = useState<number | ''>('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>({ type: null, text: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [facturasPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Función de alerta
  const showAlert = useCallback((type: 'success' | 'error' | 'info', title: string, text: string) => {
    setStatusMessage({ type, text: `${title}: ${text}` });
    setTimeout(() => setStatusMessage({ type: null, text: null }), 3000);
  }, []);

  // Carga de datos
  const buscarFacturasInicial = useCallback(async () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    window.location.replace("/signin");
    return;
  }

  setLoading(true);

  try {
    // Esta es la línea que te marca error en consola
    const response = await fetch("http://localhost:3000/facturas", {
      method: 'GET',
      headers: { 
        "Authorization": `Bearer ${token}`, // El 403 suele ser porque el token está mal o expiró
        "Content-Type": "application/json"
      }
    });

    // Si la respuesta no es 200 OK (es 400 o 403 como en tus fotos)
    if (!response.ok) {
      console.error(`Error de respuesta: ${response.status}`);
      setFacturas([]); // IMPORTANTE: Seteamos lista vacía para que no explote el .filter
      return; 
    }

    const data = await response.json();

    // Verificamos que 'data' sea realmente lo que esperamos
    if (Array.isArray(data)) {
      setFacturas(data);
    } else {
      console.warn("Los datos recibidos no son un Array:", data);
      setFacturas([]); 
    }

    setCurrentPage(1);

  } catch (error) {
    // Si hay error de red o el servidor está apagado
    console.error("Error de conexión:", error);
    setFacturas([]); // Mantenemos la seguridad de la App
  } finally {
    setLoading(false);
  }
}, [showAlert]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token || facturas.length === 0) {
      buscarFacturasInicial();
    }
  }, [buscarFacturasInicial, facturas.length]);

  // Handlers
  const handleTextChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setCurrentPage(1);
    };

  const handleSelectChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value);
      setCurrentPage(1);
    };

  const handleNumberChange = (setter: React.Dispatch<React.SetStateAction<number | ''>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setter(value === '' ? '' : parseFloat(value));
      setCurrentPage(1);
    };

  const clearFilters = () => {
    setFilterProveedor("");
    setFilterEmpresa("");
    setFilterBanco("");
    setFilterMoneda("");
    setFilterNumeroReferencia("");
    setFilterFechaDesde("");
    setFilterFechaHasta("");
    setFilterConcepto("");
    setFilterMontoMin('');
    setFilterMontoMax('');
    setCurrentPage(1);
  };

  // Filtrado
  const filteredFacturas = useMemo(() => {
    const dateFrom = filterFechaDesde ? new Date(filterFechaDesde) : null;
    const dateTo = filterFechaHasta ? new Date(filterFechaHasta) : null;
    const dateToExclusive = dateTo ? new Date(dateTo.getTime()) : null;
    if (dateToExclusive) dateToExclusive.setDate(dateToExclusive.getDate() + 1);

    return facturas.filter(factura => {
      const matchesEmpresa = !filterEmpresa || factura.empresa.toLowerCase().includes(filterEmpresa.toLowerCase());
      const matchesProveedor = !filterProveedor || factura.proveedor.toLowerCase().includes(filterProveedor.toLowerCase());
      const matchesBanco = !filterBanco || (factura.banco && factura.banco.toLowerCase().includes(filterBanco.toLowerCase()));
      const matchesMoneda = !filterMoneda || factura.moneda.toLowerCase() === filterMoneda.toLowerCase();
      const matchesNumeroReferencia = !filterNumeroReferencia || (factura.numeroReferencia && factura.numeroReferencia.includes(filterNumeroReferencia));
     const matchesConcepto = !filterConcepto || (factura.concepto && factura.concepto.toLowerCase().includes(filterConcepto.toLowerCase()));

      let matchesMontoRange = true;
      if (filterMontoMin !== '' && factura.monto < filterMontoMin) matchesMontoRange = false;
      if (filterMontoMax !== '' && factura.monto > filterMontoMax) matchesMontoRange = false;

      let matchesFechaRange = true;
      const facturaDate = new Date(factura.fecha).getTime();
      if (dateFrom) matchesFechaRange = matchesFechaRange && facturaDate >= dateFrom.getTime();
      if (dateToExclusive) matchesFechaRange = matchesFechaRange && facturaDate < dateToExclusive.getTime();

      const matchesRole = true;

      return matchesEmpresa && matchesProveedor && matchesBanco && matchesMoneda &&
             matchesNumeroReferencia && matchesConcepto && matchesMontoRange && matchesFechaRange && matchesRole;
    });
  }, [facturas, filterEmpresa, filterProveedor, filterBanco, filterMoneda, filterNumeroReferencia,
      filterConcepto, filterMontoMin, filterMontoMax, filterFechaDesde, filterFechaHasta, userRole, userCompanies]);

  // Paginación
  const indexOfLastFactura = currentPage * facturasPerPage;
  const indexOfFirstFactura = indexOfLastFactura - facturasPerPage;
  const currentFacturas = filteredFacturas.slice(indexOfFirstFactura, indexOfLastFactura);
  const totalPages = Math.ceil(filteredFacturas.length / facturasPerPage);

  // Exportación CSV
  const exportToCsv = () => {
    if (filteredFacturas.length === 0) {
      showAlert("info", "Sin datos", "No hay datos para exportar.");
      return;
    }
    const headers = ["ID", "Proveedor", "Empresa", "Fecha", "Moneda", "Monto", "Concepto", "Banco", "Referencia"];
    const csvContent = [
      headers.join(","),
      ...filteredFacturas.map(f =>
        `"${f.id}","${f.proveedor}","${f.empresa}","${new Date(f.fecha).toLocaleDateString()}","${f.moneda}","${f.monto}","${f.concepto?.replace(/"/g, '""')}","${f.banco || ''}","${f.numeroReferencia || ''}"`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "comprobantes.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showAlert("success", "Exportado", "Archivo CSV descargado.");
  };

  // Estilos de input reutilizables
  const inputClass = "w-full h-10 px-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="space-y-4">
      {/* Mensaje de estado */}
      {statusMessage.text && (
        <div className={`px-4 py-3 rounded-md text-sm ${
          statusMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          statusMessage.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* Panel de Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header del panel */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Filtros de búsqueda
            <span className="text-xs text-gray-400">({filteredFacturas.length} resultados)</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              Limpiar
            </button>
            <button
              onClick={exportToCsv}
              className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar
            </button>
          </div>
        </div>

        {/* Contenido de filtros */}
        {showFilters && (
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className={labelClass}>Proveedor</label>
                <input
                  type="text"
                  className={inputClass}
                  value={filterProveedor}
                  onChange={handleTextChange(setFilterProveedor)}
                  placeholder="Buscar..."
                />
              </div>
              <div>
                <label className={labelClass}>Empresa</label>
                <input
                  type="text"
                  className={inputClass}
                  value={filterEmpresa}
                  onChange={handleTextChange(setFilterEmpresa)}
                  placeholder="Buscar..."
                />
              </div>
              <div>
                <label className={labelClass}>Fecha desde</label>
                <input
                  type="date"
                  className={inputClass}
                  value={filterFechaDesde}
                  onChange={handleTextChange(setFilterFechaDesde)}
                />
              </div>
              <div>
                <label className={labelClass}>Fecha hasta</label>
                <input
                  type="date"
                  className={inputClass}
                  value={filterFechaHasta}
                  onChange={handleTextChange(setFilterFechaHasta)}
                />
              </div>
              <div>
                <label className={labelClass}>Moneda</label>
                <select
                  className={inputClass}
                  value={filterMoneda}
                  onChange={handleSelectChange(setFilterMoneda)}
                >
                  <option value="">Todas</option>
                  <option value="USD">USD</option>
                  <option value="$">$</option>
                  <option value="¢">¢</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Monto mínimo</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={filterMontoMin === '' ? '' : filterMontoMin}
                  onChange={handleNumberChange(setFilterMontoMin)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className={labelClass}>Monto máximo</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={filterMontoMax === '' ? '' : filterMontoMax}
                  onChange={handleNumberChange(setFilterMontoMax)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className={labelClass}>Concepto</label>
                <input
                  type="text"
                  className={inputClass}
                  value={filterConcepto}
                  onChange={handleTextChange(setFilterConcepto)}
                  placeholder="Buscar..."
                />
              </div>
              <div>
                <label className={labelClass}>Banco</label>
                <input
                  type="text"
                  className={inputClass}
                  value={filterBanco}
                  onChange={handleTextChange(setFilterBanco)}
                  placeholder="Buscar..."
                />
              </div>
              <div>
                <label className={labelClass}>No. Referencia</label>
                <input
                  type="text"
                  className={inputClass}
                  value={filterNumeroReferencia}
                  onChange={handleTextChange(setFilterNumeroReferencia)}
                  placeholder="Buscar..."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-gray-500">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Cargando comprobantes...</span>
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {!loading && filteredFacturas.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No se encontraron comprobantes</p>
          <p className="text-xs text-gray-400">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Tabla de datos */}
      {!loading && filteredFacturas.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Proveedor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Empresa</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Moneda</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Banco</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Referencia</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Concepto</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">Doc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentFacturas.map((factura, idx) => (
                  <tr key={factura.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 transition-colors`}>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{factura.proveedor}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{factura.empresa}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(factura.fecha).toLocaleDateString('es-CR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{factura.moneda}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-semibold text-right tabular-nums">
                      {factura.monto.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{factura.banco || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">{factura.numeroReferencia || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate" title={factura.concepto}>
                      {factura.concepto}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {factura.documentoUrl ? (
                        <a
                          href={factura.documentoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
                          title="Ver documento"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500">
                Mostrando {indexOfFirstFactura + 1} - {Math.min(indexOfLastFactura, filteredFacturas.length)} de {filteredFacturas.length}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
