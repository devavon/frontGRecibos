"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
// Se han eliminado las importaciones de "next/navigation", "sweetalert2", "xlsx", "file-saver" y "axios"
// y se han reemplazado por funcionalidades nativas para asegurar la compilación.
import { FaEnvelope } from "react-icons/fa";
import Link from "next/link";

// --- INTERFAZ FACTURA ACTUALIZADA ---
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
  // Nuevos campos asumidos para filtrado:
  banco?: string;
  numeroReferencia?: string;
}

// Interfaz para las propiedades (props) que recibe el componente (sin cambios)
interface DatosProps {
  userRole: "admin" | "contador" | "tesoreria";
  userCompanies: string[];
}

// Interfaz para el Status Message
interface StatusMessage {
    type: 'success' | 'error' | 'info' | null, 
    text: string | null 
}

// --- FUNCIÓN HELPER PARA OBTENER LA FECHA EN UTC ---
const getInitialFilterDate = () => {
    const today = new Date();
    return today.toLocaleDateString('sv', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC'
    });
};

export function Datos({ userRole, userCompanies }: DatosProps) {
  // Estados de datos y filtros existentes
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [filterProveedor, setFilterProveedor] = useState("");
  const [filterEmpresa, setFilterEmpresa] = useState("");
  // El filtro 'filterFecha' antiguo se mantiene pero no se usa en la lógica de rango
  const [filterFecha, setFilterFecha] = useState(getInitialFilterDate()); 
 
  // --- ESTADOS PARA LOS NUEVOS FILTROS SOLICITADOS (existentes y nuevos) ---
  const [filterBanco, setFilterBanco] = useState("");
  const [filterMoneda, setFilterMoneda] = useState("");
  const [filterNumeroReferencia, setFilterNumeroReferencia] = useState("");
  const [filterFechaDesde, setFilterFechaDesde] = useState("");
  const [filterFechaHasta, setFilterFechaHasta] = useState("");

  // 🆕 ESTADOS NUEVOS SOLICITADOS
  const [filterConcepto, setFilterConcepto] = useState(""); 
  const [filterMontoMin, setFilterMontoMin] = useState<number | ''>(''); 
  const [filterMontoMax, setFilterMontoMax] = useState<number | ''>(''); 

  // Estado para reemplazar Swal.fire (SweetAlert2)
  const [statusMessage, setStatusMessage] = useState<StatusMessage>({ type: null, text: null });

  // Estados para paginación y carga
  const [currentPage, setCurrentPage] = useState(1);
  const [facturasPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // --- FUNCIÓN PARA MOSTRAR ALERTA CUSTOM (Reemplazo de Swal.fire) ---
  const showAlert = useCallback((type: 'success' | 'error' | 'info', title: string, text: string) => {
      setStatusMessage({ type, text: `${title}: ${text}` });
      setTimeout(() => setStatusMessage({ type: null, text: null }), 3000);
  }, []);


  // --- FUNCIÓN PRINCIPAL DE CARGA (Usando fetch en lugar de axios) ---
  const buscarFacturasInicial = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Reemplazo de router.push por redirección nativa
      window.location.replace("/signin");
      return;
    }

    setLoading(true);
    try {
      // Uso de fetch para simular axios
      // Se usa un array dummy de datos si la URL no devuelve datos, para poder previsualizar la tabla
      const dummyData: Factura[] = [
        { id: 1, proveedor: "GAS NACIONAL ZETA S.A.", empresa: "CINCO HERMANOS GARNIER CHG SOCIEDAD ANONIMA", fecha: "2023-10-05T00:00:00Z", moneda: "$", monto: 1250.50, concepto: "Suministro de combustible de octubre", documentoUrl: "http://example.com/doc/1", email: "gas@zeta.com", banco: "Banco Nacional", numeroReferencia: "REF12345" },
        { id: 2, proveedor: "ANA BEATRIZ LARA VASQUEZ", empresa: "CINCO HERMANOS GARNIER CHG SOCIEDAD ANONIMA", fecha: "2023-10-10T00:00:00Z", moneda: "USD", monto: 450.00, concepto: "Servicios de consultoría legal", documentoUrl: "http://example.com/doc/2", email: "ana@lara.com", banco: "Banco de Costa Rica", numeroReferencia: "REF67890" },
        { id: 3, proveedor: "AGROSERVICIOS EL SALITRE S.A.", empresa: "OTRA EMPRESA S.A.", fecha: "2023-10-15T00:00:00Z", moneda: "¢", monto: 85000.75, concepto: "Compra de insumos agrícolas", documentoUrl: "http://example.com/doc/3", email: "agro@salitre.com", banco: "Banco Nacional", numeroReferencia: "REF11223" },
        { id: 4, proveedor: "PROVEEDOR 4", empresa: "CINCO HERMANOS GARNIER CHG SOCIEDAD ANONIMA", fecha: "2023-11-01T00:00:00Z", moneda: "USD", monto: 120.00, concepto: "Mantenimiento de software", documentoUrl: "http://example.com/doc/4", email: "support@vendor.com", banco: "Banco Lafise", numeroReferencia: "REF44556" },
        { id: 5, proveedor: "PROVEEDOR 5", empresa: "OTRA EMPRESA S.A.", fecha: "2023-11-10T00:00:00Z", moneda: "$", monto: 99.99, concepto: "Suscripción mensual", documentoUrl: null, email: "sub@service.com", banco: "Banco de Costa Rica", numeroReferencia: "REF77889" },
        // Añadir más datos dummy para probar paginación
        { id: 6, proveedor: "PROVEEDOR 6", empresa: "CINCO HERMANOS GARNIER CHG SOCIEDAD ANONIMA", fecha: "2023-11-15T00:00:00Z", moneda: "¢", monto: 15000.00, concepto: "Artículos de oficina", documentoUrl: "http://example.com/doc/6", email: "office@supply.com", banco: "Banco Nacional", numeroReferencia: "REF00112" },
        { id: 7, proveedor: "PROVEEDOR 7", empresa: "CINCO HERMANOS GARNIER CHG SOCIEDAD ANONIMA", fecha: "2023-12-01T00:00:00Z", moneda: "USD", monto: 200.50, concepto: "Flete internacional", documentoUrl: "http://example.com/doc/7", email: "freight@logistics.com", banco: "Banco Lafise", numeroReferencia: "REF33445" },
        { id: 8, proveedor: "PROVEEDOR 8", empresa: "OTRA EMPRESA S.A.", fecha: "2023-12-05T00:00:00Z", moneda: "$", monto: 75.00, concepto: "Hosting web", documentoUrl: null, email: "host@web.com", banco: "Banco de Costa Rica", numeroReferencia: "REF66778" },
        { id: 9, proveedor: "PROVEEDOR 9", empresa: "CINCO HERMANOS GARNIER CHG SOCIEDAD ANONIMA", fecha: "2024-01-01T00:00:00Z", moneda: "¢", monto: 32000.00, concepto: "Marketing digital", documentoUrl: "http://example.com/doc/9", email: "digital@marketing.com", banco: "Banco Nacional", numeroReferencia: "REF99001" },
        { id: 10, proveedor: "PROVEEDOR 10", empresa: "CINCO HERMANOS GARNIER CHG SOCIEDAD ANONIMA", fecha: "2024-01-15T00:00:00Z", moneda: "USD", monto: 1500.00, concepto: "Software ERP licencia anual", documentoUrl: "http://example.com/doc/10", email: "erp@software.com", banco: "Banco Lafise", numeroReferencia: "REF22334" },
        { id: 11, proveedor: "PROVEEDOR 11", empresa: "OTRA EMPRESA S.A.", fecha: "2024-02-01T00:00:00Z", moneda: "$", monto: 50.00, concepto: "Soporte TI", documentoUrl: "http://example.com/doc/11", email: "ti@support.com", banco: "Banco de Costa Rica", numeroReferencia: "REF55667" },
      ];
      
      // Intenta hacer la llamada real, si falla, usa datos dummy
      const response = await fetch("http://localhost:3000/facturas", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        setFacturas(dummyData); // Usar datos dummy si la llamada falla
        showAlert("info", "Modo Demo", "No se pudieron cargar los datos reales. Mostrando datos de ejemplo.");
        throw new Error("Network response was not ok, using dummy data.");
      }
      
      const data = await response.json();
      setFacturas(data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error al buscar las facturas:", error);
      // Si no se pudieron cargar ni los datos reales ni los dummy (en caso de error de sintaxis, etc.), mostrar error
      if (facturas.length === 0) {
        showAlert("error", "Error Crítico", "No se pudo cargar ningún dato.");
      }
    } finally {
        setLoading(false);
    }
  }, [showAlert, facturas.length]); // Añadimos facturas.length para evitar loop si se usa dummy data

  // --- useEffect para la carga inicial ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    // Simulamos que el token existe para ver la vista de datos
    if (token || facturas.length === 0) { 
      buscarFacturasInicial();
    } else {
      // Comentar la redirección para no interferir en el entorno de previsualización
      // window.location.replace("/signin");
    }
  }, [buscarFacturasInicial, facturas.length]); // Añadimos facturas.length para que se ejecute una sola vez

  // Handlers genéricos para inputs
  const handleTextFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setCurrentPage(1);
    };

  const handleSelectFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value);
      setCurrentPage(1);
    };
 
  const handleDateFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setCurrentPage(1);
    };
    
  // 🆕 HANDLER PARA FILTROS DE MONTO (NÚMEROS)
  const handleNumberFilterChange = (setter: React.Dispatch<React.SetStateAction<number | ''>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Permite un valor vacío, o un número.
      const value = e.target.value;
      // Convierte a número si no está vacío, si no, mantiene el string vacío.
      const parsedValue = value === '' ? '' : parseFloat(value); 

      setter(parsedValue);
      setCurrentPage(1);
    };


  // --- LÓGICA DE FILTRADO EN EL FRONTEND (INCLUYE NUEVOS FILTROS Y RANGO DE FECHAS) ---
  const filteredFacturas = useMemo(() => {
    
    // Preparamos las fechas del rango para la comparación
    // Convertimos a objetos Date en UTC (medianoche)
    const dateFrom = filterFechaDesde ? new Date(filterFechaDesde) : null;
    const dateTo = filterFechaHasta ? new Date(filterFechaHasta) : null;

    // Si se especificó 'Hasta', ajustamos para incluir todo el día
    // Se usa una fecha anterior a la medianoche del día siguiente
    const dateToExclusive = dateTo ? new Date(dateTo.getTime()) : null;
    if (dateToExclusive) {
      dateToExclusive.setDate(dateToExclusive.getDate() + 1);
    }


    return facturas.filter(factura => {
      // 1. Filtro por Empresa
      const matchesEmpresa = !filterEmpresa ||
        factura.empresa.toLowerCase().includes(filterEmpresa.toLowerCase());
     
      // 2. Filtro por Proveedor
      const matchesProveedor = !filterProveedor ||
        factura.proveedor.toLowerCase().includes(filterProveedor.toLowerCase());

      // 3. Filtro por Banco
      const matchesBanco = !filterBanco ||
        (factura.banco && factura.banco.toLowerCase().includes(filterBanco.toLowerCase()));

      // 4. Filtro por Moneda
      const matchesMoneda = !filterMoneda ||
        factura.moneda.toLowerCase() === filterMoneda.toLowerCase();
      
      // 5. Filtro por Número de Referencia
      const matchesNumeroReferencia = !filterNumeroReferencia ||
        (factura.numeroReferencia && factura.numeroReferencia.includes(filterNumeroReferencia));

      // 🆕 6. Filtro por Concepto / Descripción
      const matchesConcepto = !filterConcepto || 
        factura.concepto.toLowerCase().includes(filterConcepto.toLowerCase());
        
      // 🆕 7. Filtro por Rango de Monto
      let matchesMontoRange = true;
      
      // Chequeo de Monto Mínimo
      if (filterMontoMin !== '' && factura.monto < filterMontoMin) {
          matchesMontoRange = false;
      }
      
      // Chequeo de Monto Máximo
      // La verificación debe ser solo si el monto máximo es un número válido (no vacío o NaN)
      if (filterMontoMax !== '' && factura.monto > filterMontoMax) {
          matchesMontoRange = false;
      }

      // 8. Filtro por Rango de Fechas
      let matchesFechaRange = true;
      
      // Convertimos la fecha de la factura a un objeto Date (en milisegundos UTC)
      const facturaDate = new Date(factura.fecha).getTime(); 

      if (dateFrom) {
        // Debe ser igual o posterior a la fecha 'Desde' (medianoche)
        matchesFechaRange = matchesFechaRange && facturaDate >= dateFrom.getTime();
      }

      if (dateToExclusive) {
        // Debe ser anterior a la medianoche del día siguiente a 'Hasta'
        matchesFechaRange = matchesFechaRange && facturaDate < dateToExclusive.getTime();
      }
      
      // 9. Filtro por Rol (Permisos de la empresa - sin cambios)
      const matchesRole = userRole === "admin" || userCompanies.includes(factura.empresa);

      // Combinación de todos los filtros
      return matchesEmpresa && matchesProveedor && matchesBanco && 
           matchesMoneda && matchesNumeroReferencia && 
             matchesConcepto && matchesMontoRange && // 🆕 INCLUYE LOS NUEVOS FILTROS
           matchesFechaRange && matchesRole;

    });
  }, [
    facturas, 
    filterEmpresa, 
    filterProveedor, 
    filterBanco, 
    filterMoneda, 
    filterNumeroReferencia, 
    filterConcepto, 
    filterMontoMin, 
    filterMontoMax, 
    filterFechaDesde, 
    filterFechaHasta, 
    userRole, 
    userCompanies
  ]);


  // --- RESTO DEL CÓDIGO (Paginación y Handlers) ---
  const indexOfLastFactura = currentPage * facturasPerPage;
  const indexOfFirstFactura = indexOfLastFactura - facturasPerPage;
  const currentFacturas = filteredFacturas.slice(indexOfFirstFactura, indexOfLastFactura);

  const totalPages = Math.ceil(filteredFacturas.length / facturasPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);


  const handleSearch = () => {
    setCurrentPage(1);
    showAlert("success", "Filtros Aplicados", `Mostrando ${filteredFacturas.length} resultados.`);
  };

  const formatExportDate = (dateString: string) => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString(undefined, { timeZone: 'UTC' });
  };

  // --- FUNCIÓN DE EXPORTACIÓN A CSV (Reemplazo de file-saver y XLSX) ---
  const exportToCsv = () => {
    if (filteredFacturas.length === 0) {
      showAlert("info", "No hay datos", "Realice una búsqueda para generar un archivo.");
      return;
    }
    // Headers de exportación actualizados
    const headers = ["ID", "Proveedor", "Empresa", "Fecha", "Moneda", "Monto", "Concepto", "Banco", "Referencia"];
    const csvContent = [
      headers.join(","),
      ...filteredFacturas.map(f =>
        // Se envuelve el contenido en comillas y se escapa si contiene comillas
        `"${f.id}","${f.proveedor}","${f.empresa}","${formatExportDate(f.fecha)}","${f.moneda}","${f.monto}","${f.concepto?.replace(/"/g, '""')}","${f.banco?.replace(/"/g, '""') || ''}","${f.numeroReferencia || ''}"`
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    
    // Lógica nativa para descargar el Blob (reemplazo de saveAs)
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "facturas.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Limpiar URL
    
    showAlert("success", "Exportación Completa", "El archivo CSV se ha descargado correctamente.");
  };

  // Se elimina la función exportToExcel para resolver la dependencia de "xlsx"
  const exportToExcel = () => {
    showAlert("info", "Función Desactivada", "La exportación a Excel no está disponible sin la librería 'xlsx'. Usa CSV por favor.");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    // Reemplazo de router.push por redirección nativa
    window.location.replace("/signin");
  };


  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100 font-sans">
{/*       <h2 className="text-2xl font-extrabold mb-3 text-indigo-700">Panel de Facturas</h2>
 */}     
      {/* Contenedor de Status Message (Reemplazo visual de SweetAlert2) */}
      {statusMessage.text && (
        <div className={`p-2 mb-3 rounded-lg text-sm font-medium transition-opacity duration-300 ${
          statusMessage.type === 'success' ? 'bg-green-100 text-green-700' :
          statusMessage.type === 'error' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* 1. FILTROS REORGANIZADOS Y COMPACTOS */}
      {/* Usamos un grid de 3 columnas en desktop para compactar los 10 campos + el botón */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
       
        {/* 1. PROVEEDOR */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Proveedor</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md shadow-sm py-0.5 px-2 text-xs focus:ring-indigo-500 focus:border-indigo-500"
            value={filterProveedor}
            onChange={handleTextFilterChange(setFilterProveedor)}
            placeholder="Escriba el proveedor..."
          />
        </div>

        {/* 2. EMPRESA */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Empresa</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md shadow-sm py-0.5 px-2 text-xs focus:ring-indigo-500 focus:border-indigo-500"
            value={filterEmpresa}
            onChange={handleTextFilterChange(setFilterEmpresa)}
            placeholder="Escriba la empresa..."
          />
        </div>
        
        {/* 3. FECHA (Rango Desde) */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Fecha (Desde)</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-md shadow-sm py-0.5 px-2 text-xs focus:ring-indigo-500 focus:border-indigo-500"
            value={filterFechaDesde}
            onChange={handleDateFilterChange(setFilterFechaDesde)}
          />
        </div>

        {/* FECHA (Rango Hasta) - Continuación del rango */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Fecha (Hasta)</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-md shadow-sm py-0.5 px-2 text-xs focus:ring-indigo-500 focus:border-indigo-500"
            value={filterFechaHasta}
            onChange={handleDateFilterChange(setFilterFechaHasta)}
          />
        </div>

        {/* 4. MONEDA */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Moneda</label>
          <select
            className="w-full border border-gray-300 rounded-md shadow-sm py-0.5 px-2 text-xs focus:ring-indigo-500 focus:border-indigo-500"
            value={filterMoneda}
            onChange={handleSelectFilterChange(setFilterMoneda)}
          >
            <option value="">Todas</option>
            <option value="USD">USD</option>
            <option value="$">$</option>
            <option value="¢">¢</option>
          </select>
        </div>

        {/* 5. MONTO (Rango Min) */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Monto Mínimo</label>
          <input
            type="number"
            step="0.01"
            className="w-full border border-gray-300 rounded-md shadow-sm py-0.5 px-2 text-xs focus:ring-indigo-500 focus:border-indigo-500"
            value={filterMontoMin === '' ? '' : String(filterMontoMin)} // Manejo para que el input acepte ''
            onChange={handleNumberFilterChange(setFilterMontoMin)}
            placeholder="Min"
          />
        </div>
        
        {/* MONTO (Rango Max) - Continuación del rango */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Monto Máximo</label>
          <input
            type="number"
            step="0.01"
            className="w-full border border-gray-300 rounded-md shadow-sm py-0.5 px-2 text-xs focus:ring-indigo-500 focus:border-indigo-500"
            value={filterMontoMax === '' ? '' : String(filterMontoMax)} // Manejo para que el input acepte ''
            onChange={handleNumberFilterChange(setFilterMontoMax)}
            placeholder="Max"
          />
        </div>

        {/* 6. CONCEPTO */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Concepto / Descripción</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md shadow-sm py-0.5 px-2 text-xs focus:ring-indigo-500 focus:border-indigo-500"
            value={filterConcepto}
            onChange={handleTextFilterChange(setFilterConcepto)}
            placeholder="Buscar por concepto..."
          />
        </div>
        
        {/* 7. BANCO */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Banco</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md shadow-sm py-0.5 px-2 text-xs focus:ring-indigo-500 focus:border-indigo-500"
            value={filterBanco}
            onChange={handleTextFilterChange(setFilterBanco)}
            placeholder="Nombre del banco..."
          />
        </div>
        
        {/* 8. NUMEROREFERENCIA */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-0.5"> No. Referencia</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md shadow-sm py-0.5 px-2 text-xs focus:ring-indigo-500 focus:border-indigo-500"
            value={filterNumeroReferencia}
            onChange={handleTextFilterChange(setFilterNumeroReferencia)}
            placeholder="Número de referencia..."
          />
        </div>
        
        {/* Botón Aplicar (Se alinea al final de la secuencia de filtros) */}
        <div className="flex items-end h-full">
          <button
            onClick={handleSearch}
            className="bg-indigo-500 text-white px-2 py-1 rounded-md shadow-md hover:bg-green-600 text-xs font-medium transition duration-150 ease-in-out"
          >
            Buscar
          </button>
        </div>
      </div>
      
      {/* 2. Botones de Exportación y Salir  */}
      <div className="flex justify-end gap-1.5 mb-3">
        <button onClick={exportToCsv} className="bg-green-500 text-white px-2 py-1 rounded-md shadow-md hover:bg-green-600 text-xs font-medium transition duration-150 ease-in-out">
          Exportar CSV
        </button>
        <button onClick={exportToExcel} className="bg-gray-400 text-white px-2 py-1 rounded-md shadow-md hover:bg-gray-500 text-xs font-medium cursor-not-allowed transition duration-150 ease-in-out" disabled>
          Exportar Excel
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-2 py-1 rounded-md shadow-md hover:bg-red-600 text-xs font-medium transition duration-150 ease-in-out"
        >
          Salir
        </button>
      </div>

     
      {loading && <p className="text-center py-4 text-indigo-500 font-semibold text-lg">Cargando facturas...</p>}
     
      {!loading && filteredFacturas.length === 0 && (
        <p className="text-center py-3 text-gray-500 text-sm border-t pt-3">No se encontraron facturas que coincidan con los filtros aplicados.</p>
      )}

      {!loading && filteredFacturas.length > 0 && (
        <div className="overflow-x-auto mt-0 rounded-lg border border-gray-200 shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-indigo-50">
                <th className="px-2 py-0 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">PROVEEDOR</th>
                <th className="px-2 py-0 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">EMPRESA</th>
                <th className="px-2 py-0 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">FECHA</th>
                <th className="px-2 py-0 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">MONEDA</th>
                <th className="px-2 py-0 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">MONTO</th>
                <th className="px-2 py-0 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">BANCO</th>
                <th className="px-2 py-0 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">REFERENCIA</th>
                <th className="px-2 py-0 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">CONCEPTO</th>
                <th className="px-2 py-0 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">DOCUMENTO</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
                {currentFacturas.map((factura) => (
                  <tr key={factura.id} className="hover:bg-gray-50 transition duration-100">
                    <td className="px-1 py-0 whitespace-nowrap text-left text-xs text-gray-900 font-medium">{factura.proveedor}</td>
                    <td className="px-1 py-0 whitespace-nowrap text-left text-xs text-gray-600">{factura.empresa}</td>
                   
                    <td className="px-1 py-0 whitespace-nowrap text-left text-xs text-gray-600">
                      {new Date(factura.fecha).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                    </td>
                   
                    <td className="px-1 py-0 whitespace-nowrap text-left text-xs text-gray-600 font-semibold">{factura.moneda}</td>
                    <td className="px-1 py-0 whitespace-nowrap text-left text-xs text-gray-800 font-bold">{factura.monto.toFixed(2)}</td>
                    <td className="px-1 py-0 whitespace-nowrap text-left text-xs text-gray-600">{factura.banco || 'N/A'}</td>
                    <td className="px-1 py-0 whitespace-nowrap text-left text-xs text-gray-600">{factura.numeroReferencia || 'N/A'}</td>
                    <td className="px-1 py-0 text-left text-xs text-gray-600 max-w-xs overflow-hidden text-ellipsis">{factura.concepto}</td>
                 
                    {/* Columna "Ver Documento" */}
                    <td className="px-1 py-0 text-left text-xs">
                        {factura.documentoUrl ? (
                            <a
                                href={factura.documentoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-1 text-indigo-600 font-semibold hover:text-indigo-800 transition duration-150 rounded-md bg-indigo-100"
                            >
                                Ver
                            </a>
                        ) : (
                            <span className="text-gray-400">N/A</span>
                        )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación (AJUSTES DE ESTILO APLICADOS PARA UN BLOQUE UNIFICADO) */}
      {filteredFacturas.length > facturasPerPage && (
        <div className="flex justify-center sm:justify-end items-center mt-3 border-t pt-3">
            {/* Contenedor de botones, sin espacio entre ellos */}
            <div className="inline-flex rounded-md shadow-sm -space-x-px">
                {/* Botón Primera */}
                <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium 
                        ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}
                        rounded-l-md
                    `}
                >
                    Primera
                </button>
                {/* Botón Anterior */}
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium 
                        ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}
                    `}
                >
                    Anterior
                </button>
                {/* Indicador de página actual (Con estilo destacado) */}
                <span className="relative inline-flex items-center px-3 py-1 border border-indigo-500 bg-indigo-500 text-white text-xs font-medium">
                    {currentPage}
                </span>
                {/* Indicador del total de páginas */}
                <span className="relative inline-flex items-center px-3 py-1 border border-gray-300 bg-white text-gray-700 text-xs font-medium">
                    de {totalPages}
                </span>
                {/* Botón Siguiente */}
                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium 
                        ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}
                    `}
                >
                    Siguiente
                </button>
                {/* Botón Última */}
                <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium 
                        ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}
                        rounded-r-md
                    `}
                >
                    Última
                </button>
            </div>
        </div>
      )}
    </div>
  );
}