import React from 'react';
// Asegúrate de que esta ruta coincida con donde guardaste el Gestor de Permisos
import UserPermissionsManager from '@/components/UserPermissionsManager'; 

// Este componente de página se renderizará cuando el usuario visite /admin/permissions
// Lo envolvemos en un componente simple para que Next.js lo reconozca como una página.
const AdminPermissionsPage = () => {
  return (
    // Puedes envolver esto en el layout de tu dashboard si tienes uno
    <div className="p-4 md:p-8"> 
      <UserPermissionsManager />
    </div>
  );
};

export default AdminPermissionsPage;