"use client";

import { Building2, Construction } from "lucide-react";
import PageHeader from "@/components/gp/PageHeader";

// Componente temporal - pendiente de implementación
const CompanyAssignmentPage = () => {
  return (
    <div>
      <PageHeader
        icon={Building2}
        title="Asignación de empresas"
        subtitle="Empresas a las que cada usuario tiene acceso"
      />
      <div className="gp-card gp-fade-in">
        <div className="gp-empty">
          <div className="gp-empty-icon">
            <Construction size={26} />
          </div>
          <div className="gp-empty-title">En desarrollo</div>
          <div className="gp-empty-hint">
            Mientras tanto, las empresas de cada usuario se asignan desde Administración → Usuarios.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAssignmentPage;
