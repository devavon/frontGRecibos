import React from 'react';
// Asegúrate de que esta ruta coincida con donde guardaste el Gestor de Permisos
import UserPermissionsManager from '@/components/UserPermissionsManager'; 

// Este componente de página se renderizará cuando el usuario visite /admin/permissions
// Lo envolvemos en un componente simple para que Next.js lo reconozca como una página.
const AdminPermissionsPage = () => {
  return (
    <UserPermissionsManager />
  );
};

export default AdminPermissionsPage;