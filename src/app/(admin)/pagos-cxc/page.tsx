"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
export default function PagosCxcPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [recibos, setRecibos] = useState([]);
  const [empresaFiltro, setEmpresaFiltro] = useState("");
  const [clienteFiltro, setClienteFiltro] = useState("");
  const [conceptoFiltro, setConceptoFiltro] = useState("");
  const [monedaFiltro, setMonedaFiltro] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [montoMin, setMontoMin] = useState("");
  const [montoMax, setMontoMax] = useState("");
  useEffect(() => {
  fetch("http://localhost:3001/companies")
    .then((res) => res.json())
    .then((data) => setCompanies(data))
    .catch((err) =>
      console.error("Error cargando empresas:", err)
    );
}, []);
useEffect(() => {
  fetch("http://localhost:3001/pagos-cxc")
    .then((res) => res.json())
    .then((data) => {
        console.log("RECIBOS:", data);
          setRecibos(data);
        })
    .catch((err) =>
      console.error("Error cargando recibos:", err)
    );
}, []);
const recibosFiltrados = recibos.filter((recibo: any) =>
  recibo.cliente?.toLowerCase().includes(
    clienteFiltro.toLowerCase()
  ) &&
  recibo.concepto?.toLowerCase().includes(
    conceptoFiltro.toLowerCase()
  ) &&
  (
    monedaFiltro === "" ||
    recibo.moneda === monedaFiltro
  )&&
(
  montoMin === "" ||
  Number(recibo.monto) >= Number(montoMin)
)
&&
(
  montoMax === "" ||
  Number(recibo.monto) <= Number(montoMax)
)
&&
(
  fechaDesde === "" ||
  new Date(recibo.fecha) >= new Date(fechaDesde)
)
&&
(
  fechaHasta === "" ||
  new Date(recibo.fecha) <= new Date(fechaHasta)
)&&
(
  empresaFiltro === "" ||
  recibo.empresa === empresaFiltro
)
);
const exportToExcel = () => {
  if (recibosFiltrados.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  const data = recibosFiltrados.map((r: any) => ({
    Cliente: r.cliente,
    Empresa: r.empresa,
    Fecha: r.fecha
      ? new Date(r.fecha).toLocaleDateString("es-CR")
      : "",
    Moneda: r.moneda,
    Monto: r.monto,
    Concepto: r.concepto
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Recibos CxC"
  );

  worksheet["!cols"] = [
    { wch: 35 },
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 40 }
  ];

  XLSX.writeFile(
    workbook,
    `Recibos_CxC_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`
  );
};

console.log("MONEDA FILTRO:", monedaFiltro);
  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">
        Recibos Pago CxC
      </h1>

      <p className="text-gray-500 mb-6">
        Gestiona y consulta los recibos de pago registrados
      </p>
      
      <div className="flex justify-end gap-2 mb-4">
        {/* Botón Excel */}
        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Excel
        </button>
        {/* Botón Limpiar */}
        <button
          onClick={() => {
            setEmpresaFiltro("");
            setClienteFiltro("");
            setConceptoFiltro("");
            setMonedaFiltro("");
            setFechaDesde("");
            setFechaHasta("");
            setMontoMin("");
            setMontoMax("");
          }}
             className="bg-white border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded"
          /* className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded" */
        >
          Limpiar
        </button>
        {/* Botón Consultas CxC */}
        <button
          onClick={async () => {
            const result = await Swal.fire({
              title: "Consulta Cuentas por Cobrar",
              html: `
                <div style="text-align:left; margin-bottom:10px;">
                  <label style="font-weight:bold;">Asunto:</label>
                  <input
                    id="swal-asunto"
                    class="swal2-input"
                    value="Consulta cuentas por cobrar"
                  >
                </div>

                <div style="text-align:left; margin-bottom:10px;">
                  <label style="font-weight:bold;">Correo fijo:</label>
                  <input
                    id="swal-email-fijo"
                    class="swal2-input"
                    value="smora@garnier.cr"
                    readonly
                  >
                </div>

                <div style="text-align:left; margin-bottom:10px;">
                  <label style="font-weight:bold;">Correo adicional:</label>
                  <input
                    id="swal-email-extra"
                    class="swal2-input"
                    placeholder="correo@empresa.com"
                  >
                </div>
                <div style="text-align:left; margin-bottom:10px;">
                  <label style="font-weight:bold;">
                    Nombre del Cliente: 
                  </label>
                  <input
                    id="swal-inquilino"
                    class="swal2-input"
                    placeholder="Nombre del Cliente"
                  >
                </div>

                <div style="text-align:left; margin-bottom:10px;">
                  <label style="font-weight:bold;">
                    Número de apartamento/Factura u otro: 
                  </label>
                  <input
                    id="swal-apartamento"
                    class="swal2-input"
                    placeholder="Ej: A-101"
                  >
                </div>

                <div style="text-align:left;">
                  <label style="font-weight:bold;">Mensaje:</label>
                  <textarea
                    id="swal-mensaje"
                    class="swal2-textarea"
                  >Buen día, adjunto consulta de cuentas por cobrar.</textarea>
                </div>
              `,
              showCancelButton: true,
              confirmButtonText: "Enviar",
              cancelButtonText: "Cancelar",
              confirmButtonColor: "#059669",

              preConfirm: () => {
                const inquilino =
                  (document.getElementById("swal-inquilino") as HTMLInputElement)?.value;

                const apartamento =
                  (document.getElementById("swal-apartamento") as HTMLInputElement)?.value;

                if (!inquilino?.trim()) {
                  Swal.showValidationMessage(
                    "Debe indicar el nombre del inquilino"
                  );
                  return false;
                }

                if (!apartamento?.trim()) {
                  Swal.showValidationMessage(
                    "Debe indicar el número de apartamento"
                  );
                  return false;
                }

                return true;
              }
            });
            if (result.isConfirmed) {
                const asunto =
                  (document.getElementById("swal-asunto") as HTMLInputElement)?.value;

                const correoFijo =
                  (document.getElementById("swal-email-fijo") as HTMLInputElement)?.value;

                const correoExtra =
                  (document.getElementById("swal-email-extra") as HTMLInputElement)?.value;

                const inquilino =
                  (document.getElementById("swal-inquilino") as HTMLInputElement)?.value;

                const apartamento =
                  (document.getElementById("swal-apartamento") as HTMLInputElement)?.value;

                const mensaje =
                  (document.getElementById("swal-mensaje") as HTMLTextAreaElement)?.value;

                console.log({
                  asunto,
                  correoFijo,
                  correoExtra,
                  inquilino,
                  apartamento,
                  mensaje
                });
                await fetch("http://localhost:3001/api/enviar-consulta-cxc", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    asunto,
                    correoFijo,
                    correoExtra,
                    inquilino,
                    apartamento,
                    mensaje,
                    correoCliente: JSON.parse(localStorage.getItem("user") || "{}").email,
                    nombreCliente: JSON.parse(localStorage.getItem("user") || "{}").name,
                    userId: JSON.parse(localStorage.getItem("user") || "{}").userId
                  })
                });
            }
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Consultas CxC
        </button>
        <button
          onClick={() => {
            router.push("/seguimiento-correos");
          }}
          className="bg-white border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded"
        >
          Seguimiento de Correos
        </button>
</div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="font-semibold mb-4">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">

          {/* Empresa */}
          <select
            className="border p-2 rounded"
            value={empresaFiltro}
            onChange={(e) => setEmpresaFiltro(e.target.value)}
          >
            <option value="">Empresa</option>

            {companies.map((company: any) => (
              <option
                key={company.id}
                value={company.name}
              >
                {company.name}
              </option>
            ))}
          </select>
          {/* Cliente */}
          <input
            type="text"
            placeholder="Cliente"
            className="border p-2 rounded"
            value={clienteFiltro}
            onChange={(e) => setClienteFiltro(e.target.value)}
          />
          {/* Fecha desde */}
          <input
            type="date"
            className="border p-2 rounded"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
          {/* Fecha hasta */}
          <input
            type="date"
            className="border p-2 rounded"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
          {/* Concepto ✅ */}
          <input
            type="text"
            placeholder="Concepto"
            className="border p-2 rounded"
            value={conceptoFiltro}
            onChange={(e) => setConceptoFiltro(e.target.value)}
          />
          {/* Monto mínimo */}
          <input
            type="number"
            placeholder="Monto mínimo"
            className="border p-2 rounded"
            value={montoMin}
            onChange={(e) => setMontoMin(e.target.value)}
          />
          {/* Monto máximo */}
          <input
            type="number"
            placeholder="Monto máximo"
            className="border p-2 rounded"
            value={montoMax}
            onChange={(e) => setMontoMax(e.target.value)}
          />
          {/* Moneda ✅ */}
          <select
            className="border p-2 rounded"
            value={monedaFiltro}
            onChange={(e) => setMonedaFiltro(e.target.value)}
          >
            <option value="">Moneda</option>
            <option value="CRC">CRC</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Monto</th>
              <th className="p-3">Concepto</th>
              <th className="p-3">Moneda</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {recibosFiltrados.map((recibo: any) => (
              <tr key={recibo.id} className="border-t">
                <td className="p-3">{recibo.cliente}</td>
                <td className="p-3">
                  {recibo.fecha
                    ? new Date(recibo.fecha).toLocaleDateString()
                    : ""}
                </td>
                <td className="p-3">
                  {recibo.moneda} {recibo.monto}
                </td>
                <td className="p-3">{recibo.concepto}</td>
                <td className="p-3">{recibo.moneda}</td>
                {/* ver doc y reenviar por correo */}
                <td className="p-3">
                  <div className="flex items-center justify-center gap-2">
                    {/* Ver PDF */}
                    <button
                      onClick={() => {
                        Swal.fire(
                          "Pendiente",
                          "El recibo aún no se encuentra disponible.",
                          "info"
                        );
                      }}
                      className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
                      title="Ver recibo"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    {/* Enviar correo */}
                    <button
                      onClick={async () => {
                        const { value: formValues } = await Swal.fire({
                          title: "Enviar Recibo",
                          html: `
                            <div style="text-align:left; margin-bottom:10px;">
                              <label style="font-weight:bold;">Asunto:</label>
                              <input
                                id="swal-asunto"
                                class="swal2-input"
                                value="Recibo de Pago - ${recibo.cliente}"
                              >
                            </div>
                            <div style="text-align:left; margin-bottom:10px;">
                              <label style="font-weight:bold;">Correo del destinatario:</label>
                              <input
                                id="swal-email"
                                class="swal2-input"
                                placeholder="correo@empresa.com"
                              >
                            </div>
                            <div style="text-align:left;">
                              <label style="font-weight:bold;">Mensaje:</label>
                              <textarea
                                id="swal-mensaje"
                                class="swal2-textarea"
                              >Buen día, adjunto envío el recibo solicitado.</textarea>
                            </div>
                          `,
                          showCancelButton: true,
                          confirmButtonText: "Enviar",
                          cancelButtonText: "Cancelar",
                          confirmButtonColor: "#059669",
                          preConfirm: () => {
                            const email =
                              (document.getElementById("swal-email") as HTMLInputElement)?.value;
                            if (!email?.trim()) {
                              Swal.showValidationMessage(
                                "El correo es obligatorio"
                              );
                              return false;
                            }
                            return {
                              email,
                              asunto: (
                                document.getElementById("swal-asunto") as HTMLInputElement
                              )?.value,
                              mensaje: (
                                document.getElementById("swal-mensaje") as HTMLTextAreaElement
                              )?.value
                            };
                          }
                        });
                        if (formValues) {
                          await fetch("http://localhost:3001/api/enviar-recibo-cxc", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                              cliente: recibo.cliente,
                              email: formValues.email,
                              asunto: formValues.asunto,
                              mensaje: formValues.mensaje
                            })
                          });
                          Swal.fire(
                            "Enviado",
                            "Correo enviado correctamente.",
                            "success"
                          );
                        }
                      }}
                      className="inline-flex items-center justify-center w-8 h-8 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded-full transition-colors"
                      title="Enviar por correo"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
