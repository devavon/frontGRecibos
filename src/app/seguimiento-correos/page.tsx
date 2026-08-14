"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
export default function SeguimientoCorreosPage() {
  const [consultas, setConsultas] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/consultas-cxc")
      .then((res) => res.json())
      .then((data) => {
        setConsultas(data);
      })
      .catch((err) => {
        console.error("Error cargando consultas:", err);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Seguimiento de Consultas CxC
      </h1>

      <p className="text-gray-500 mb-6">
        Consulta y da seguimiento a las solicitudes enviadas a Cuentas por Cobrar.
      </p>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Fecha</th>
              <th className="p-3">Empresa</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Referencia</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {consultas.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={5}>
                  No hay consultas registradas
                </td>
              </tr>
            ) : (
              consultas.map((consulta) => (
                <tr key={consulta.id} className="border-t">
                  <td className="p-3">
                    {new Date(consulta.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-3">
                    {consulta.empresa}
                  </td>

                  <td className="p-3">
                    {consulta.nombreCliente}
                  </td>

                  <td className="p-3">
                    {consulta.numeroReferencia}
                  </td>

                  <td className="p-3">
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                        ${
                            consulta.estado === "Pendiente"
                            ? "bg-yellow-100 text-yellow-800"
                            : consulta.estado === "En estudio"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }
                        `}
                    >
                        {consulta.estado}
                    </span>
                 </td>
                  <td className="p-3">
                <button
                    onClick={async () => {
                        const { value: nuevoEstado } = await Swal.fire({
                            title: consulta.asunto,
                            input: "select",
                            inputOptions: {
                            Pendiente: "Pendiente",
                            "En estudio": "En estudio",
                            Cerrada: "Cerrada"
                            },
                            inputValue: consulta.estado,
                            html: `
                            <div style="text-align:left;margin-top:15px;">
                                <p><b>Solicitante:</b><br>${consulta.correoSolicitante || ""}</p>
                                <p><b>Empresa:</b><br>${consulta.empresa || ""}</p>
                                <p><b>Cliente:</b><br>${consulta.nombreCliente || ""}</p>
                                <p><b>Referencia:</b><br>${consulta.numeroReferencia || ""}</p>
                                <p><b>Mensaje:</b><br>${consulta.mensaje || ""}</p>
                            </div>
                            `,
                            showCancelButton: true,
                            confirmButtonText: "Guardar",
                            cancelButtonText: "Cancelar",
                            confirmButtonColor: "#059669"
                    });
                        if (!nuevoEstado) return;
                        await fetch(
                            `http://localhost:3001/consultas-cxc/${consulta.id}`,
                            {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                estado: nuevoEstado
                            })
                            }
                        );

                        window.location.reload();
                        }}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                    Ver
                </button>
                </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}