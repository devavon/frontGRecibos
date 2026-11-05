"use client";
// Modal para cambiar el rol de un usuario (estilo Gpeople).
import React, { useState } from "react";
import { KeyRound, Save } from "lucide-react";
import Modal from "@/components/gp/Modal";
import { RoleOptions } from "./users/roles";
import type { Role } from "./users/roles";

interface UserData {
  id: string;
  name: string;
  roleId: number;
}

interface EditRoleModalProps {
  user: UserData;
  allRoles: Role[];
  onClose: () => void;
  onSave: (userId: string, newRoleId: number) => Promise<void>;
  isSaving: boolean;
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({ user, allRoles, onClose, onSave, isSaving }) => {
  const [newRoleId, setNewRoleId] = useState<number>(user.roleId || 0);

  return (
    <Modal
      open
      size="md"
      title={`Rol de ${user.name}`}
      subtitle="Define qué puede ver y hacer en GComprobantes"
      icon={KeyRound}
      onClose={onClose}
      busy={isSaving}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={isSaving} className="gp-btn gp-btn-secondary">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSave(user.id, newRoleId)}
            disabled={isSaving || newRoleId === user.roleId}
            className="gp-btn gp-btn-primary"
          >
            {isSaving ? (
              <>
                <span className="gp-spinner gp-spinner-sm" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                Guardando...
              </>
            ) : (
              <>
                <Save size={13} /> Guardar rol
              </>
            )}
          </button>
        </>
      }
    >
      <RoleOptions roles={allRoles} value={newRoleId} onChange={setNewRoleId} disabled={isSaving} />
    </Modal>
  );
};

export default EditRoleModal;
