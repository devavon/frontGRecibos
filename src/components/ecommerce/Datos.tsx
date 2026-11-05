"use client";
// Comprobantes de pago — vista principal.
// Diseño: sistema Garnier de Gpeople (PageHeader, tarjetas KPI, panel de
// filtros, tabla gp-table, paginación y modal de envío con la marca).
// La lógica de datos es la misma de antes: GET /facturas con el token,
// filtros en cliente, exportación CSV y POST /api/enviar-comprobante.
import React, { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Receipt,
  Download,
  SlidersHorizontal,
  ChevronDown,
  Eye,
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileSearch,
  Send,
  Wallet,
  DollarSign,
  RotateCcw,
} from "lucide-react";
import PageHeader from "@/components/gp/PageHeader";
import Modal from "@/components/gp/Modal";

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

const MONEDAS_COLONES = ["¢", "₡", "colones", "crc"];
const MONEDAS_DOLARES = ["$", "usd", "dólares", "dolares"];

const fmtMonto = (n: number) =>
  Number(n || 0).toLocaleString("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Tarjeta KPI (mismo patrón que el Dashboard de Gpeople)
function KpiCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  color: string;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="gp-card p-5">
        <div className="gp-skeleton h-10 w-10 rounded-xl mb-3" />
        <div className="gp-skeleton h-7 w-24 mb-2" />
        <div className="gp-skeleton h-3 w-32" />
      </div>
    );
  }
  return (
    <div className="gp-kpi-card gp-card gp-card-hover p-5 gp-fade-in">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <div className="mt-4">
        <div className="gp-kpi-amount leading-none" style={{ color: "var(--gp-text-primary)" }}>
          {value}
        </div>
        <div className="text-[12px] mt-1.5" style={{ color: "var(--gp-text-secondary)" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const [filterMontoMin, setFilterMontoMin] = useState<number | "">("");
  const [filterMontoMax, setFilterMontoMax] = useState<number | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [facturasPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  // Modal de envío por correo
  const [envio, setEnvio] = useState<{
    factura: Factura;
    email: string;
    asunto: string;
    mensaje: string;
  } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [envioError, setEnvioError] = useState<string | null>(null);

  // Carga de datos
  const buscarFacturasInicial = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.replace("/signin");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/facturas`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(`Error de respuesta: ${response.status}`);

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/signin";
          return;
        }

        setFacturas([]);
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        // De la fecha más reciente a la más antigua
        const facturasOrdenadas = data.sort((a, b) => {
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        });
        setFacturas(facturasOrdenadas);
      } else {
        console.warn("Los datos recibidos no son un Array:", data);
        setFacturas([]);
      }

      setCurrentPage(1);
    } catch (error) {
      console.error("Error de conexión:", error);
      setFacturas([]);
      toast.error("Sin conexión con el servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    buscarFacturasInicial();
  }, [buscarFacturasInicial]);

  // Handlers
  const handleTextChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setCurrentPage(1);
    };

  const handleSelectChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value);
      setCurrentPage(1);
    };

  const handleNumberChange =
    (setter: React.Dispatch<React.SetStateAction<number | "">>) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setter(value === "" ? "" : parseFloat(value));
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
    setFilterMontoMin("");
    setFilterMontoMax("");
    setCurrentPage(1);
  };

  const filtrosActivos = [
    filterProveedor,
    filterEmpresa,
    filterBanco,
    filterMoneda,
    filterNumeroReferencia,
    filterFechaDesde,
    filterFechaHasta,
    filterConcepto,
    filterMontoMin,
    filterMontoMax,
  ].filter((v) => v !== "").length;

  // Filtrado
  const filteredFacturas = useMemo(() => {
    const dateFrom = filterFechaDesde ? new Date(filterFechaDesde) : null;
    const dateTo = filterFechaHasta ? new Date(filterFechaHasta) : null;
    const dateToExclusive = dateTo ? new Date(dateTo.getTime()) : null;
    if (dateToExclusive) dateToExclusive.setDate(dateToExclusive.getDate() + 1);

    return facturas.filter((factura) => {
      const matchesEmpresa = !filterEmpresa || factura.empresa.toLowerCase().includes(filterEmpresa.toLowerCase());
      const matchesProveedor =
        !filterProveedor || factura.proveedor.toLowerCase().includes(filterProveedor.toLowerCase());
      const matchesBanco =
        !filterBanco || (factura.banco && factura.banco.toLowerCase().includes(filterBanco.toLowerCase()));
      const matchesMoneda = !filterMoneda || factura.moneda.toLowerCase() === filterMoneda.toLowerCase();
      const matchesNumeroReferencia =
        !filterNumeroReferencia ||
        (factura.numeroReferencia && factura.numeroReferencia.includes(filterNumeroReferencia));
      const matchesConcepto =
        !filterConcepto ||
        (factura.concepto && factura.concepto.toLowerCase().includes(filterConcepto.toLowerCase()));

      let matchesMontoRange = true;
      if (filterMontoMin !== "" && factura.monto < filterMontoMin) matchesMontoRange = false;
      if (filterMontoMax !== "" && factura.monto > filterMontoMax) matchesMontoRange = false;

      let matchesFechaRange = true;
      const facturaDate = new Date(factura.fecha).getTime();
      if (dateFrom) matchesFechaRange = matchesFechaRange && facturaDate >= dateFrom.getTime();
      if (dateToExclusive) matchesFechaRange = matchesFechaRange && facturaDate < dateToExclusive.getTime();

      return (
        matchesEmpresa &&
        matchesProveedor &&
        matchesBanco &&
        matchesMoneda &&
        matchesNumeroReferencia &&
        matchesConcepto &&
        matchesMontoRange &&
        matchesFechaRange
      );
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
  ]);

  // Totales por moneda (sobre lo filtrado)
  const totales = useMemo(() => {
    let colones = 0;
    let dolares = 0;
    for (const f of filteredFacturas) {
      const m = String(f.moneda || "").trim().toLowerCase();
      if (MONEDAS_COLONES.includes(m)) colones += Number(f.monto) || 0;
      else if (MONEDAS_DOLARES.includes(m)) dolares += Number(f.monto) || 0;
    }
    return { colones, dolares };
  }, [filteredFacturas]);

  // Paginación
  const indexOfLastFactura = currentPage * facturasPerPage;
  const indexOfFirstFactura = indexOfLastFactura - facturasPerPage;
  const currentFacturas = filteredFacturas.slice(indexOfFirstFactura, indexOfLastFactura);
  const totalPages = Math.ceil(filteredFacturas.length / facturasPerPage);

  // Exportación CSV
  const exportToCsv = () => {
    if (filteredFacturas.length === 0) {
      toast("No hay datos para exportar.", { icon: "ℹ️" });
      return;
    }
    const headers = ["ID", "Proveedor", "Empresa", "Fecha", "Moneda", "Monto", "Concepto", "Banco", "Referencia"];
    const csvContent = [
      headers.join(","),
      ...filteredFacturas.map(
        (f) =>
          `"${f.id}","${f.proveedor}","${f.empresa}","${new Date(f.fecha).toLocaleDateString()}","${f.moneda}","${f.monto}","${f.concepto?.replace(/"/g, '""')}","${f.banco || ""}","${f.numeroReferencia || ""}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "comprobantes.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Archivo CSV descargado");
  };

  const abrirEnvio = (factura: Factura) => {
    setEnvioError(null);
    setEnvio({
      factura,
      asunto: `Comprobante de Pago - ${factura.proveedor}`,
      email: factura.email || "EnlaceBCT@corporacionbct.com",
      mensaje: "Buen día, adjunto envío el comprobante de pago solicitado.",
    });
  };

  const enviarComprobante = async () => {
    if (!envio) return;
    if (!envio.email.trim()) {
      setEnvioError("El correo es obligatorio");
      return;
    }
    const token = localStorage.getItem("token");
    setEnviando(true);
    setEnvioError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enviar-comprobante`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: envio.email.trim(),
          facturaId: envio.factura.id,
          asunto: envio.asunto,
          mensajePersonalizado: envio.mensaje,
        }),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any;
      try {
        data = await response.json();
      } catch {
        throw new Error("La respuesta del servidor no es válida");
      }

      if (!response.ok) {
        throw new Error(data?.error || "Error al enviar el comprobante");
      }

      toast.success(`Comprobante enviado a ${envio.email.trim()}`);
      setEnvio(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("ERROR:", err);
      setEnvioError(err.message || "Error de conexión");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Receipt}
        title="Comprobantes de Pago"
        subtitle="Gestione y consulte los comprobantes registrados"
        badge={loading ? undefined : facturas.length}
        action={
          <button onClick={exportToCsv} className="gp-btn gp-btn-primary" disabled={loading}>
            <Download size={14} /> Exportar CSV
          </button>
        }
      />

      {/* KPIs sobre el resultado filtrado */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          icon={Receipt}
          label={filtrosActivos > 0 ? "Comprobantes (filtrados)" : "Comprobantes registrados"}
          value={filteredFacturas.length.toLocaleString("es-CR")}
          color="var(--gp-green-text)"
          loading={loading}
        />
        <KpiCard
          icon={Wallet}
          label="Total en colones"
          value={`₡${fmtMonto(totales.colones)}`}
          color="var(--gp-info-text)"
          loading={loading}
        />
        <KpiCard
          icon={DollarSign}
          label="Total en dólares"
          value={`$${fmtMonto(totales.dolares)}`}
          color="var(--gp-gold)"
          loading={loading}
        />
      </div>

      {/* Panel de filtros */}
      <div className="gp-card">
        <div
          className="flex items-center justify-between px-4 py-3 flex-wrap gap-2"
          style={{ borderBottom: showFilters ? "1px solid var(--gp-border)" : "none" }}
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-[13px] font-semibold gp-font-head"
            style={{ color: "var(--gp-text-primary)" }}
          >
            <SlidersHorizontal size={15} style={{ color: "var(--gp-green-text)" }} />
            Filtros de búsqueda
            {filtrosActivos > 0 && <span className="gp-badge gp-badge-success">{filtrosActivos} activos</span>}
            <span className="text-[11px] font-normal" style={{ color: "var(--gp-text-muted)", fontFamily: "var(--gp-font-body)" }}>
              {filteredFacturas.length} resultados
            </span>
            <ChevronDown
              size={14}
              className="transition-transform duration-200"
              style={{ color: "var(--gp-text-muted)", transform: showFilters ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
          <button onClick={clearFilters} className="gp-btn gp-btn-ghost gp-btn-sm" disabled={filtrosActivos === 0}>
            <RotateCcw size={12} /> Limpiar
          </button>
        </div>

        {showFilters && (
          <div className="p-4 gp-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="gp-label">Proveedor</label>
                <input type="text" className="gp-input" value={filterProveedor} onChange={handleTextChange(setFilterProveedor)} placeholder="Buscar..." />
              </div>
              <div>
                <label className="gp-label">Empresa</label>
                <input type="text" className="gp-input" value={filterEmpresa} onChange={handleTextChange(setFilterEmpresa)} placeholder="Buscar..." />
              </div>
              <div>
                <label className="gp-label">Fecha desde</label>
                <input type="date" className="gp-input" value={filterFechaDesde} onChange={handleTextChange(setFilterFechaDesde)} />
              </div>
              <div>
                <label className="gp-label">Fecha hasta</label>
                <input type="date" className="gp-input" value={filterFechaHasta} onChange={handleTextChange(setFilterFechaHasta)} />
              </div>
              <div>
                <label className="gp-label">Moneda</label>
                <select className="gp-input" value={filterMoneda} onChange={handleSelectChange(setFilterMoneda)}>
                  <option value="">Todas</option>
                  <option value="$">$</option>
                  <option value="¢">¢</option>
                  <option value="USD">USD</option>
                  <option value="Colones">Colones</option>
                </select>
              </div>
              <div>
                <label className="gp-label">Monto mínimo</label>
                <input
                  type="number"
                  step="0.01"
                  className="gp-input tabular-nums"
                  value={filterMontoMin === "" ? "" : filterMontoMin}
                  onChange={handleNumberChange(setFilterMontoMin)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="gp-label">Monto máximo</label>
                <input
                  type="number"
                  step="0.01"
                  className="gp-input tabular-nums"
                  value={filterMontoMax === "" ? "" : filterMontoMax}
                  onChange={handleNumberChange(setFilterMontoMax)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="gp-label">Concepto</label>
                <input type="text" className="gp-input" value={filterConcepto} onChange={handleTextChange(setFilterConcepto)} placeholder="Buscar..." />
              </div>
              <div>
                <label className="gp-label">Banco</label>
                <input type="text" className="gp-input" value={filterBanco} onChange={handleTextChange(setFilterBanco)} placeholder="Buscar..." />
              </div>
              <div>
                <label className="gp-label">No. Referencia</label>
                <input
                  type="text"
                  className="gp-input"
                  value={filterNumeroReferencia}
                  onChange={handleTextChange(setFilterNumeroReferencia)}
                  placeholder="Buscar..."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cargando */}
      {loading && (
        <div className="gp-card overflow-hidden p-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="gp-skeleton h-10 rounded-md" />
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {!loading && filteredFacturas.length === 0 && (
        <div className="gp-card gp-fade-in">
          <div className="gp-empty">
            <div className="gp-empty-icon">
              <FileSearch size={26} />
            </div>
            <div className="gp-empty-title">No se encontraron comprobantes</div>
            <div className="gp-empty-hint">
              {filtrosActivos > 0
                ? "Ningún comprobante coincide con los filtros. Ajústelos o límpielos para ver todo."
                : "Aún no hay comprobantes registrados para sus empresas."}
            </div>
            {filtrosActivos > 0 && (
              <button onClick={clearFilters} className="gp-btn gp-btn-secondary mt-1">
                <RotateCcw size={13} /> Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabla */}
      {!loading && filteredFacturas.length > 0 && (
        <div className="gp-card overflow-hidden gp-fade-in">
          <div className="overflow-x-auto">
            <table className="gp-table">
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Empresa</th>
                  <th>Fecha</th>
                  <th>Moneda</th>
                  <th style={{ textAlign: "right" }}>Monto</th>
                  <th>Banco</th>
                  <th>Referencia</th>
                  <th>Concepto</th>
                  <th style={{ textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentFacturas.map((factura) => (
                  <tr key={factura.id}>
                    <td className="font-medium" style={{ color: "var(--gp-text-primary)" }}>
                      {factura.proveedor}
                    </td>
                    <td className="whitespace-normal break-words min-w-[160px]">{factura.empresa}</td>
                    <td className="whitespace-nowrap tabular-nums">
                      {new Date(factura.fecha).toLocaleDateString("es-CR")}
                    </td>
                    <td>
                      <span className="gp-badge gp-badge-info">{factura.moneda}</span>
                    </td>
                    <td
                      className="font-semibold text-right tabular-nums whitespace-nowrap"
                      style={{ color: "var(--gp-text-primary)" }}
                    >
                      {fmtMonto(factura.monto)}
                    </td>
                    <td>{factura.banco || "—"}</td>
                    <td className="font-mono text-[11px]">{factura.numeroReferencia || "—"}</td>
                    <td className="max-w-[220px] truncate" title={factura.concepto}>
                      {factura.concepto}
                    </td>
                    <td className="text-center">
                      {factura.documentoUrl ? (
                        <div className="flex items-center justify-center gap-1">
                          <a
                            href={factura.documentoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gp-icon-btn"
                            title="Ver documento"
                            aria-label="Ver documento"
                          >
                            <Eye size={15} style={{ color: "var(--gp-green-text)" }} />
                          </a>
                          <button
                            onClick={() => abrirEnvio(factura)}
                            className="gp-icon-btn"
                            title="Enviar por correo"
                            aria-label="Enviar por correo"
                          >
                            <Mail size={15} style={{ color: "var(--gp-info-text)" }} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: "var(--gp-border-dark)" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-4 py-2.5 border-t flex-wrap gap-2"
              style={{ borderColor: "var(--gp-border)", backgroundColor: "var(--gp-table-header)" }}
            >
              <div className="text-[12px] tabular-nums" style={{ color: "var(--gp-text-muted)" }}>
                Mostrando {indexOfFirstFactura + 1}–{Math.min(indexOfLastFactura, filteredFacturas.length)} de{" "}
                {filteredFacturas.length}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="gp-icon-btn" aria-label="Primera página">
                  <ChevronsLeft size={15} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                  className="gp-icon-btn"
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={15} />
                </button>
                <span
                  className="px-2.5 py-1 text-[12px] font-medium tabular-nums rounded-md"
                  style={{ color: "var(--gp-text-primary)", backgroundColor: "white", border: "1px solid var(--gp-border)" }}
                >
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                  className="gp-icon-btn"
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="gp-icon-btn"
                  aria-label="Última página"
                >
                  <ChevronsRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: enviar comprobante por correo */}
      <Modal
        open={!!envio}
        title="Enviar comprobante"
        subtitle={envio ? `${envio.factura.proveedor} · ${fmtMonto(envio.factura.monto)} ${envio.factura.moneda}` : undefined}
        icon={Send}
        onClose={() => setEnvio(null)}
        busy={enviando}
        size="lg"
        footer={
          <>
            <button onClick={() => setEnvio(null)} disabled={enviando} className="gp-btn gp-btn-secondary">
              Cancelar
            </button>
            <button onClick={enviarComprobante} disabled={enviando} className="gp-btn gp-btn-primary">
              {enviando ? (
                <>
                  <span className="gp-spinner gp-spinner-sm" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={13} /> Enviar
                </>
              )}
            </button>
          </>
        }
      >
        {envio && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              enviarComprobante();
            }}
          >
            {envioError && (
              <div className="gp-alert gp-alert-danger">
                <span>{envioError}</span>
              </div>
            )}
            <div>
              <label className="gp-label">Asunto</label>
              <input
                className="gp-input"
                value={envio.asunto}
                onChange={(e) => setEnvio({ ...envio, asunto: e.target.value })}
                placeholder="Ej: Comprobante de pago"
                disabled={enviando}
              />
            </div>
            <div>
              <label className="gp-label">Correo del destinatario *</label>
              <input
                type="email"
                className="gp-input"
                value={envio.email}
                onChange={(e) => setEnvio({ ...envio, email: e.target.value })}
                placeholder="ejemplo@correo.com"
                disabled={enviando}
                required
              />
            </div>
            <div>
              <label className="gp-label">Mensaje</label>
              <textarea
                className="gp-input"
                rows={4}
                value={envio.mensaje}
                onChange={(e) => setEnvio({ ...envio, mensaje: e.target.value })}
                placeholder="Escriba un mensaje opcional..."
                disabled={enviando}
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
