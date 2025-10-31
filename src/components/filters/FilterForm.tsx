"use client";
import React from "react";

interface FilterFormProps {
  filters: {
    empresa: string;
    proveedor: string;
    numero: string; //
    fechaDesde: string;
    fechaHasta: string;
  };
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onReset: () => void;
}

const FilterForm: React.FC<FilterFormProps> = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Filtros</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1">Empresa</label>
          <input
            type="text"
            name="empresa"
            value={filters.empresa}
            onChange={onFilterChange}
            className="w-full border p-2 rounded"
            placeholder="Nombre de la empresa"
          />
        </div>
        <div>
          <label className="block mb-1">Proveedor</label>
          <input
            type="text"
            name="proveedor"
            value={filters.proveedor}
            onChange={onFilterChange}
            className="w-full border p-2 rounded"
            placeholder="Nombre del proveedor"
          />
        </div>
        <div>
          <label className="block mb-1">N° Comprobante</label>
          <input
            type="text"
            name="numero"
            value={filters.numero}
            onChange={onFilterChange}
            className="w-full border p-2 rounded"
            placeholder="Ej. FAC-001"
          />
        </div>
        <div>
          <label className="block mb-1">Fecha desde</label>
          <input
            type="date"
            name="fechaDesde"
            value={filters.fechaDesde}
            onChange={onFilterChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Fecha hasta</label>
          <input
            type="date"
            name="fechaHasta"
            value={filters.fechaHasta}
            onChange={onFilterChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterForm;
