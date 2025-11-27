import React, { useState } from 'react';
// ⚠️ IMPORTAR TUS DEPENDENCIAS
// Ajusta las importaciones según tu proyecto (ej: import { Key, X, Save, Loader2 } from 'lucide-react';)
// También ajusta la importación de tus tipos/interfaces (UserData, ROLES)

// --- INTERFACES NECESARIAS (Asegúrate de que UserData y ROLES sean correctos) ---
// Define la interfaz del usuario si no la tienes en un archivo compartido
interface UserData {
    id: string; // O number, según tu backend
    name: string;
    roleId: number;
    // ... otros campos irrelevantes para este modal
}

// Define el formato de tu array de roles
// (Asumiendo que ROLES es un array de objetos con id: number y name: string)
interface RoleOption {
    id: number;
    name: string;
}

interface EditRoleModalProps {
    user: UserData; // El usuario que se está editando
    allRoles: RoleOption[]; // El array de roles disponibles
    onClose: () => void;
    // onSave recibirá el ID del usuario y el nuevo ID de rol
    onSave: (userId: string, newRoleId: number) => Promise<void>; 
    isSaving: boolean; // Para manejar el estado de carga
}

// Placeholder para iconos si no usas lucide-react o similar
const Key = (props: any) => <svg {...props}><circle cx="12" cy="12" r="10"/><path d="m14 12-2 2-2-2"/></svg>;
const X = (props: any) => <svg {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const Save = (props: any) => <svg {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v4h10"/></svg>;
const Loader2 = (props: any) => <svg {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
// Si tienes tus propios componentes de icono, reemplaza los placeholders de arriba.

// --- COMPONENTE DEL MODAL ---
const EditRoleModal: React.FC<EditRoleModalProps> = ({ user, allRoles, onClose, onSave, isSaving }) => {
    
    // Inicializa el estado con el rol actual del usuario
    const [newRoleId, setNewRoleId] = useState<number>(user.roleId);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Llama a la función onSave con el ID del usuario y el nuevo rol seleccionado
        onSave(user.id, newRoleId);
    };

    return (
        // Fondo y contenedor principal del modal
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col">
                
                {/* Encabezado */}
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        {/* Ajusta Key al icono que uses */}
                        <Key className="w-5 h-5 mr-2 text-indigo-600" />
                        Editar Rol de: <span className="ml-1 text-indigo-600 truncate">{user.name}</span>
                    </h2>
                    {/* Ajusta X al icono que uses */}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-5">
                    
                    {/* Campo Rol */}
                    <div className="mb-4">
                        <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            Rol Asignado
                        </label>
                        <select
                            id="role-select"
                            name="roleId"
                            value={newRoleId}
                            // Asegura que el valor se convierta a número entero
                            onChange={(e) => setNewRoleId(parseInt(e.target.value))} 
                            disabled={isSaving}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        >
                            {/* Mapea tus opciones de roles */}
                            {allRoles.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-3 mt-4">
                        <button 
                            onClick={onClose} 
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center shadow-md ${
                                isSaving
                                    ? 'bg-indigo-300 text-white cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30'
                            }`}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    {/* Ajusta Loader2 al icono que uses */}
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...
                                </>
                            ) : (
                                <>
                                    {/* Ajusta Save al icono que uses */}
                                    <Save className="w-4 h-4 mr-2" /> Guardar Rol
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditRoleModal;