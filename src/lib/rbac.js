/**
 * Lógica de Control de Acceso Basado en Roles (RBAC).
 * Esta lógica se usa tanto en el Frontend (para enmascarar la UI)
 * como en el Backend (para la validación final de seguridad).
 */

// Definición de roles y sus permisos.
// Los permisos deben coincidir con las funciones que se validarán.
const PERMISSIONS = {
    // Permisos generales
    'user:read': ['Admin', 'Manager', 'User'],
    'user:create': ['Admin', 'Manager'],
    'user:update': ['Admin', 'Manager'],

    // Permiso Crítico para la Seguridad
    'user:delete': ['Admin'],
};

/**
 * Mapeo de IDs de rol (usados en la base de datos o en selects) a nombres de rol.
 * Esto ayuda a mantener la consistencia entre números y nombres legibles.
 * NOTA: Ajusta esto para que coincida con tus IDs de rol reales si usas números (0, 1, 2, 3).
 */
export const ROLES_MAP = {
    0: { id: 0, name: 'User', color: 'bg-gray-500' },
    1: { id: 1, name: 'Manager', color: 'bg-blue-500' },
    2: { id: 2, name: 'Admin', color: 'bg-red-600' },
    // Si tienes más roles, añádelos aquí
};

/**
 * Función central para verificar si un usuario con un rol específico
 * tiene permiso para realizar una acción.
 *
 * @param {string} roleName - El nombre del rol del usuario ('Admin', 'Manager', 'User').
 * @param {string} permission - El permiso requerido ('user:delete', 'user:create', etc.).
 * @returns {boolean} True si el rol tiene el permiso, false en caso contrario.
 */
export const canPerform = (roleName, permission) => {
    const rolesAllowed = PERMISSIONS[permission];

    if (!rolesAllowed) {
        console.warn(`Permiso desconocido: ${permission}`);
        return false;
    }

    // Comprueba si el nombre del rol del usuario está en la lista de roles permitidos para ese permiso
    return rolesAllowed.includes(roleName);
};

// Exporta una lista de nombres de rol para su uso en la UI (selects, etc.)
export const ROLE_NAMES = Object.values(ROLES_MAP).map(r => r.name);