"use client";
import { useEffect, useState } from "react";
export default function PagosCxcPage() {
  const [companies, setCompanies] = useState([]);
  useEffect(() => {
  fetch("http://localhost:3000/companies")
    .then((res) => res.json())
    .then((data) => setCompanies(data))
    .catch((err) =>
      console.error("Error cargando empresas:", err)
    );
}, []);
  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">
        Recibos Pago CxC
      </h1>

      <p className="text-gray-500 mb-6">
        Gestiona y consulta los recibos de pago registrados
      </p>
      
      <div className="flex justify-end mb-4">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Consultas CxC
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="font-semibold mb-4">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">

          {/* Empresa */}
          <select className="border p-2 rounded">
            <option value="">Empresa</option>

            {companies.map((company: any) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          {/* Cliente */}
          <input
            type="text"
            placeholder="Cliente"
            className="border p-2 rounded"
          />

          {/* Fecha desde */}
          <input
            type="date"
            className="border p-2 rounded"
          />

          {/* Fecha hasta */}
          <input
            type="date"
            className="border p-2 rounded"
          />

          {/* Concepto ✅ */}
          <input
            type="text"
            placeholder="Concepto"
            className="border p-2 rounded"
          />

          {/* Monto mínimo */}
          <input
            type="number"
            placeholder="Monto mínimo"
            className="border p-2 rounded"
          />

          {/* Monto máximo */}
          <input
            type="number"
            placeholder="Monto máximo"
            className="border p-2 rounded"
          />

          {/* Moneda ✅ */}
          <select className="border p-2 rounded">
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

            {/* EJEMPLO REAL */}
            <tr className="border-t">
              <td className="p-3">Philip Richard Share (Casa 39 Residencias)</td>
              <td className="p-3">01/05/2026</td>
              <td className="p-3">USD 9,349.00</td>
              <td className="p-3">Pago a Casa 39 Residencias</td>
              <td className="p-3">USD</td>
              <td className="p-3">
                <button className="text-blue-600 hover:underline">
                  Ver PDF
                </button>
              </td>
            </tr>

            <tr className="border-t">
              <td className="p-3">Cliente Demo</td>
              <td className="p-3">26/05/2026</td>
              <td className="p-3">₡150,000</td>
              <td className="p-3">Pago ejemplo</td>
              <td className="p-3">CRC</td>
              <td className="p-3">
                <button className="text-blue-600 hover:underline">
                  Ver PDF
                </button>
              </td>
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  );
}
