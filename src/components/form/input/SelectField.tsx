import React from 'react';

// Define la estructura para cada opción del select
interface Option {
    value: string;
    label: string;
}

// Propiedades del componente SelectField
interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    id: string;
    label: string;
    options: Option[];
    placeholder?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ 
    id, 
    label, 
    options, 
    placeholder, 
    className = '', 
    ...props 
}) => {
    return (
        <div className={`flex flex-col ${className}`}>
            <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                {label}
            </label>
            <select
                id={id}
                // Clases de Tailwind para un estilo de campo de formulario estándar
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                {...props}
            >
                {/* Opción de Placeholder, si se proporciona */}
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}

                {/* Renderizar opciones dinámicas */}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectField;
