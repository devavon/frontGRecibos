import UserCompanyAssignment from '@/components/UserCompanyAssignment'; 
import DefaultLayout from '@/components/Layouts/DefaultLayout'; // Asegúrate que esta ruta a tu DefaultLayout sea correcta

// Este componente se renderizará automáticamente cuando se acceda a la ruta /companies/assign
const CompanyAssignmentPage = () => {
  return (
    // Utilizamos el Layout principal para que se muestren el menú lateral y el header
    <DefaultLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Título de la página */}
        <h1 className="text-3xl font-bold leading-tight text-gray-900 mb-6 border-b pb-2">
          Asignación de Usuarios a Compañías
        </h1>
        
        {/* Contenedor del componente principal (el formulario de lógica) */}
        <div className="bg-white shadow-xl rounded-xl p-6 transition-all duration-300 hover:shadow-2xl">
          <UserCompanyAssignment />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CompanyAssignmentPage;
