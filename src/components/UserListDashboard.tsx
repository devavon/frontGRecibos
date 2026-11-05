"use client";
// Gestión de usuarios — diseño del sistema Garnier (Gpeople UsuariosList):
// PageHeader con acción, buscador, tabla gp-table, badges de rol/empresas y
// modales de la marca. Las llamadas a la API son las mismas de antes:
//   GET  /api/admin/companies · GET /api/admin/users
//   POST /api/admin/users · PUT /api/admin/users/:id · DELETE /api/admin/users/:id
//   POST /api/admin/users/:id/resend-invite
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  KeyRound,
  Building2,
  Send,
  Trash2,
  Search,
  UserPlus,
  Shield,
  ShieldAlert,
  Users,
  Save,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import EditRoleModal from "./EditRoleModal";
import { ROLES, RoleOptions } from "./users/roles";
import type { Role } from "./users/roles";
import PageHeader from "@/components/gp/PageHeader";
import Modal from "@/components/gp/Modal";
import ConfirmModal from "@/components/gp/ConfirmModal";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin`;

// =========================================================
// TIPOS
// =========================================================
interface Company {
  id: string;
  name: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  companyId: string | null;
  allowedCompanyIds: string[];
  roleId: number; // 3 = Administrador, 4 = Usuario Regular
  createdAt: string | Date;
}

interface NewUserDataPayload {
  name: string;
  email: string;
  companyId: string | null;
  roleId: number;
}

const getRoleName = (roleId: number | null | undefined): string => {
  if (roleId === null || roleId === undefined) return "Usuario";
  const role = ROLES.find((r) => r.id === roleId);
  return role ? role.name : "Rol Desconocido";
};

const getAuthToken = (): string | null => localStorage.getItem("token");

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
export default function UserListDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const auth = useAuth() as any;

  const isCurrentUserAdmin = auth.user && auth.user.roleId === 3;
  const isAuthenticated = auth.isAuthenticated;
  const token = auth.token;

  const [users, setUsers] = useState<UserData[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  // Rol
  const [userToEditRole, setUserToEditRole] = useState<UserData | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Empresas (permisos)
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Alta
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Confirmaciones
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [userToResend, setUserToResend] = useState<UserData | null>(null);
  const [resending, setResending] = useState(false);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !isCurrentUserAdmin || !token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(companiesResponse.data as Company[]);

      const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let usersList = usersResponse.data as UserData[];
      // Se excluye al usuario autenticado de la lista de edición
      usersList = usersList.filter((u) => u.id !== auth.user.id);
      usersList.sort((a, b) => a.name.localeCompare(b.name));
      setUsers(usersList);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Fallo en fetchData:", err);
      const errorMessage = err.response?.data?.message || err.message || "Error desconocido al cargar datos.";
      setError(`No se pudieron cargar los usuarios: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, isCurrentUserAdmin, auth.user]);

  useEffect(() => {
    if (!auth.isLoading && isAuthenticated) {
      fetchData();
    }
  }, [auth.isLoading, isAuthenticated, fetchData]);

  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [users, busqueda]);

  // --- Empresas permitidas ---
  const handleSavePermissions = async (updatedIds: string[]) => {
    if (!editingUser || !token) {
      toast.error("Error de sesión o usuario no seleccionado.");
      return;
    }
    if (!editingUser.id) {
      toast.error("Error: ID de usuario no encontrado para la actualización.");
      return;
    }

    setIsSaving(true);
    const companyIdsAsNumbers = updatedIds.map((id) => parseInt(id, 10));

    try {
      const payload = {
        name: editingUser.name,
        email: editingUser.email,
        roleId: editingUser.roleId ? Number(editingUser.roleId) : 4,
        companyIds: companyIdsAsNumbers,
      };

      const response = await axios.put(`${API_BASE_URL}/users/${parseInt(editingUser.id, 10)}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const updatedUser = response.data as UserData;
      setUsers((prev) =>
        prev.map((u) =>
          String(u.id) === String(editingUser.id) ? { ...u, ...updatedUser, allowedCompanyIds: updatedIds } : u
        )
      );

      setEditingUser(null);
      toast.success("Empresas del usuario actualizadas");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error al guardar permisos:", err);
      const apiError = err.response?.data?.error || err.response?.data?.message || err.message;
      toast.error(`Error al actualizar: ${apiError}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Rol ---
  const handleSaveNewRole = async (userId: string, newRoleId: number) => {
    setIsUpdatingRole(true);
    const authToken = getAuthToken();
    const userToUpdate = userToEditRole;

    if (!userToUpdate || !authToken) {
      console.error("Operación cancelada: Token o datos de usuario ausentes.");
      setIsUpdatingRole(false);
      return;
    }

    try {
      // Se envían también las empresas actuales para no borrarlas
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: userToUpdate.name,
          email: userToUpdate.email,
          roleId: newRoleId,
          companyIds: userToUpdate.allowedCompanyIds.map((id) => parseInt(id)),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Fallo en la actualización: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          /* no-op */
        }
        throw new Error(errorMessage);
      }

      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, roleId: newRoleId } : u)));
      setUserToEditRole(null);
      toast.success("Rol actualizado");
    } catch (err) {
      console.error("Error al actualizar el rol:", err);
      toast.error((err as Error).message || "No se pudo actualizar el rol");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // --- Eliminar ---
  const confirmarEliminar = async () => {
    if (!userToDelete) return;
    const userId = parseInt(userToDelete.id);
    const authToken = getAuthToken();
    if (!authToken) {
      toast.error("No está autenticado.");
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Fallo al eliminar: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          /* no-op */
        }
        throw new Error(errorMessage);
      }

      setUsers((prev) => prev.filter((u) => parseInt(u.id) !== userId));
      toast.success(`${userToDelete.name} fue eliminado`);
      setUserToDelete(null);
    } catch (err) {
      console.error("Error al eliminar el usuario:", err);
      toast.error((err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  // --- Reenviar invitación ---
  const confirmarReenvio = async () => {
    if (!userToResend) return;
    const authToken = getAuthToken();
    if (!authToken) {
      toast.error("No está autenticado.");
      return;
    }

    setResending(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userToResend.id}/resend-invite`,
        { method: "POST", headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (!response.ok) {
        let errorMsg = `Error ${response.status}`;
        try {
          const data = await response.json();
          errorMsg = data.error || data.details || errorMsg;
        } catch {
          /* respuesta no es JSON */
        }
        throw new Error(errorMsg);
      }

      toast.success(`Invitación reenviada a ${userToResend.email}`);
      setUserToResend(null);
    } catch (err) {
      console.error("[RESEND] Error completo:", err);
      toast.error((err as Error).message);
    } finally {
      setResending(false);
    }
  };

  // --- Alta ---
  const handleAddUser = async (newUserData: NewUserDataPayload) => {
    if (!token) {
      setAddError("No se encontró token de autenticación. Inicie sesión nuevamente.");
      return;
    }

    setIsAddingUser(true);
    setAddError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/users`, newUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const createdUser = response.data as UserData;

      setIsAddModalOpen(false);
      setUsers((prev) => [...prev, createdUser].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`Usuario creado. Se enviaron las credenciales a ${createdUser.email}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error al crear usuario:", err);
      const apiError = err.response?.data?.message || err.response?.data?.error || err.message;
      setAddError(apiError || "Error desconocido al crear el usuario.");
    } finally {
      setIsAddingUser(false);
    }
  };

  // --- Render ---
  if (auth.isLoading) {
    return (
      <div className="gp-card">
        <div className="gp-loading-block">
          <span className="gp-spinner" />
          Cargando sesión...
        </div>
      </div>
    );
  }

  if (!isCurrentUserAdmin) {
    return (
      <div className="gp-card gp-fade-in">
        <div className="gp-empty">
          <div
            className="gp-empty-icon"
            style={{ background: "var(--gp-danger-bg)", color: "var(--gp-danger-text)", boxShadow: "none" }}
          >
            <ShieldAlert size={26} />
          </div>
          <div className="gp-empty-title">Acceso restringido</div>
          <div className="gp-empty-hint">
            Esta sección es solo para administradores. Si necesita acceso, solicítelo al administrador del sistema.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={Users}
        title="Usuarios"
        subtitle="Administre usuarios, roles y empresas con acceso"
        badge={loading ? undefined : users.length}
        action={
          <button
            onClick={() => {
              setAddError(null);
              setIsAddModalOpen(true);
            }}
            className="gp-btn gp-btn-primary"
          >
            <UserPlus size={14} /> Nuevo usuario
          </button>
        }
      />

      {/* Buscador */}
      <div className="mb-4 relative max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--gp-text-muted)" }}
        />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o correo..."
          className="gp-input"
          style={{ paddingLeft: 34 }}
          aria-label="Buscar usuario"
        />
      </div>

      {loading && (
        <div className="gp-card overflow-hidden p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="gp-skeleton h-10 rounded-md" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="gp-alert gp-alert-danger" role="alert">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
          <button onClick={fetchData} className="gp-btn gp-btn-secondary gp-btn-sm">
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && usuariosFiltrados.length > 0 && (
        <div className="gp-card overflow-hidden gp-fade-in">
          <div className="overflow-x-auto">
            <table className="gp-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Empresas</th>
                  <th style={{ textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0"
                          style={{ backgroundColor: "var(--gp-green-light)", color: "var(--gp-green-text)" }}
                        >
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <span className="font-medium text-[13px]" style={{ color: "var(--gp-text-primary)" }}>
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`gp-badge ${user.roleId === 3 ? "gp-badge-dark" : "gp-badge-success"}`}>
                        {user.roleId === 3 && <Shield size={10} />}
                        {getRoleName(user.roleId)}
                      </span>
                    </td>
                    <td>
                      <PermissionBadge
                        count={user.roleId === 3 ? companies?.length || 0 : user.allowedCompanyIds?.length || 0}
                        total={companies?.length || 0}
                      />
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          onClick={() => setUserToEditRole(user)}
                          className="gp-icon-btn"
                          title="Cambiar rol"
                          aria-label="Cambiar rol"
                        >
                          <KeyRound size={15} style={{ color: "var(--gp-green-text)" }} />
                        </button>
                        <button
                          onClick={() => setEditingUser(user)}
                          className="gp-icon-btn"
                          title="Empresas con acceso"
                          aria-label="Empresas con acceso"
                        >
                          <Building2 size={15} style={{ color: "var(--gp-info-text)" }} />
                        </button>
                        <button
                          onClick={() => setUserToResend(user)}
                          className="gp-icon-btn"
                          title="Reenviar invitación"
                          aria-label="Reenviar invitación"
                        >
                          <Send size={15} style={{ color: "var(--gp-gold)" }} />
                        </button>
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="gp-icon-btn"
                          title="Eliminar usuario"
                          aria-label="Eliminar usuario"
                        >
                          <Trash2 size={15} style={{ color: "var(--gp-danger-text)" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && usuariosFiltrados.length === 0 && (
        <div className="gp-card gp-fade-in">
          <div className="gp-empty">
            <div className="gp-empty-icon">
              <User size={26} />
            </div>
            <div className="gp-empty-title">
              {busqueda ? "Ningún usuario coincide con la búsqueda" : "Aún no hay otros usuarios"}
            </div>
            <div className="gp-empty-hint">
              {busqueda
                ? "Pruebe con otro nombre o correo."
                : "Cree el primer usuario con el botón «Nuevo usuario»; recibirá sus credenciales por correo."}
            </div>
          </div>
        </div>
      )}

      {/* Modal: empresas con acceso */}
      {editingUser && (
        <PermissionModal
          user={editingUser}
          allCompanies={companies}
          onClose={() => setEditingUser(null)}
          onSave={handleSavePermissions}
          isSaving={isSaving}
        />
      )}

      {/* Modal: nuevo usuario */}
      {isAddModalOpen && (
        <AddUserModal
          allCompanies={companies}
          allRoles={ROLES}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddUser}
          isSaving={isAddingUser}
          apiError={addError}
        />
      )}

      {/* Modal: rol */}
      {userToEditRole && (
        <EditRoleModal
          user={userToEditRole}
          allRoles={ROLES}
          onClose={() => setUserToEditRole(null)}
          onSave={handleSaveNewRole}
          isSaving={isUpdatingRole}
        />
      )}

      <ConfirmModal
        open={!!userToDelete}
        tone="danger"
        title={`¿Eliminar a ${userToDelete?.name ?? ""}?`}
        confirmLabel="Sí, eliminar"
        loading={deleting}
        onCancel={() => setUserToDelete(null)}
        onConfirm={confirmarEliminar}
      >
        El usuario y sus accesos serán eliminados. Esta acción no se puede deshacer.
      </ConfirmModal>

      <ConfirmModal
        open={!!userToResend}
        tone="info"
        title="¿Reenviar invitación?"
        confirmLabel="Sí, reenviar"
        loading={resending}
        onCancel={() => setUserToResend(null)}
        onConfirm={confirmarReenvio}
      >
        Se generará una nueva contraseña temporal y se enviará un correo a{" "}
        <strong style={{ color: "var(--gp-text-primary)" }}>{userToResend?.email}</strong>.
      </ConfirmModal>
    </div>
  );
}

// =========================================================
// MODAL: NUEVO USUARIO
// =========================================================
interface AddUserModalProps {
  allCompanies: Company[];
  allRoles: Role[];
  onClose: () => void;
  onSave: (newUserData: NewUserDataPayload) => void;
  isSaving: boolean;
  apiError: string | null;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ allCompanies, allRoles, onClose, onSave, isSaving, apiError }) => {
  const defaultCompanyId = allCompanies.length > 0 ? allCompanies[0].id : null;

  const [formData, setFormData] = useState<NewUserDataPayload>({
    name: "",
    email: "",
    companyId: defaultCompanyId,
    roleId: 4,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setFormError(null);
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("El nombre y el correo electrónico son obligatorios.");
      return;
    }
    // La contraseña la genera el backend y se envía por correo
    onSave(formData);
  };

  const errorVisible = formError || apiError;

  return (
    <Modal
      open
      title="Nuevo usuario"
      subtitle="Recibirá una contraseña temporal por correo"
      icon={UserPlus}
      onClose={onClose}
      busy={isSaving}
      footer={
        <>
          <button onClick={onClose} disabled={isSaving} className="gp-btn gp-btn-secondary">
            Cancelar
          </button>
          <button onClick={() => handleSubmit()} disabled={isSaving} className="gp-btn gp-btn-primary">
            {isSaving ? (
              <>
                <span className="gp-spinner gp-spinner-sm" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                Creando...
              </>
            ) : (
              <>
                <Save size={13} /> Crear usuario
              </>
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {errorVisible && (
          <div className="gp-alert gp-alert-danger">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{errorVisible}</span>
          </div>
        )}

        <div>
          <label className="gp-label">Nombre completo *</label>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--gp-text-muted)" }} />
            <input
              className="gp-input"
              style={{ paddingLeft: 32 }}
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              disabled={isSaving}
              required
            />
          </div>
        </div>

        <div>
          <label className="gp-label">Correo *</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--gp-text-muted)" }} />
            <input
              type="email"
              className="gp-input"
              style={{ paddingLeft: 32 }}
              placeholder="usuario@garnier.cr"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              disabled={isSaving}
              required
            />
          </div>
        </div>

        <div>
          <label className="gp-label">Empresa principal (opcional)</label>
          <select
            className="gp-input"
            value={formData.companyId || ""}
            onChange={(e) => setFormData((p) => ({ ...p, companyId: e.target.value === "" ? null : e.target.value }))}
            disabled={isSaving || allCompanies.length === 0}
          >
            <option value="">— Ninguna (administrador o usuario global) —</option>
            {allCompanies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {allCompanies.length === 0 && (
            <p className="text-[11px] mt-1" style={{ color: "var(--gp-danger-text)" }}>
              No hay empresas disponibles para asignar.
            </p>
          )}
        </div>

        <div>
          <label className="gp-label">Rol</label>
          <RoleOptions
            roles={allRoles}
            value={formData.roleId}
            onChange={(roleId) => setFormData((p) => ({ ...p, roleId }))}
            disabled={isSaving}
          />
        </div>
      </form>
    </Modal>
  );
};

// =========================================================
// MODAL: EMPRESAS CON ACCESO
// =========================================================
interface PermissionModalProps {
  user: UserData;
  allCompanies: Company[];
  onClose: () => void;
  onSave: (updatedIds: string[]) => void;
  isSaving: boolean;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ user, allCompanies, onClose, onSave, isSaving }) => {
  const isAdmin = user && user.roleId === 3;

  // Un administrador ve todas las empresas; su acceso no se edita aquí
  const initialSelectedIds = useMemo(
    () => (isAdmin ? allCompanies.map((c) => c.id) : user.allowedCompanyIds || []),
    [isAdmin, allCompanies, user.allowedCompanyIds]
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [filtro, setFiltro] = useState("");
  const isInteractiveDisabled = isAdmin || isSaving;

  const toggle = (companyId: string, isChecked: boolean) => {
    if (isInteractiveDisabled) return;
    setSelectedIds((prev) => (isChecked ? [...prev, companyId] : prev.filter((id) => id !== companyId)));
  };

  const toggleAll = () => {
    if (isInteractiveDisabled) return;
    setSelectedIds(selectedIds.length === allCompanies.length ? [] : allCompanies.map((c) => c.id));
  };

  const visibles = allCompanies.filter((c) => c.name.toLowerCase().includes(filtro.trim().toLowerCase()));

  return (
    <Modal
      open
      size="lg"
      title={`Empresas de ${user.name}`}
      subtitle="Seleccione las empresas cuyos comprobantes puede consultar"
      icon={Building2}
      onClose={onClose}
      busy={isSaving}
      footer={
        <>
          <button onClick={onClose} disabled={isSaving} className="gp-btn gp-btn-secondary">
            Cancelar
          </button>
          <button
            onClick={() => !isAdmin && !isSaving && onSave(selectedIds)}
            disabled={isSaving || isAdmin}
            className="gp-btn gp-btn-primary"
          >
            {isSaving ? (
              <>
                <span className="gp-spinner gp-spinner-sm" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                Guardando...
              </>
            ) : (
              <>
                <Save size={13} /> Guardar empresas
              </>
            )}
          </button>
        </>
      }
    >
      {isAdmin && (
        <div className="gp-alert gp-alert-info mb-3">
          <Shield size={15} className="shrink-0 mt-0.5" />
          <span>
            Este usuario es <strong>Administrador</strong> y tiene acceso a todas las empresas por defecto. Sus
            empresas no se modifican aquí.
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--gp-text-muted)" }} />
          <input
            className="gp-input"
            style={{ paddingLeft: 32 }}
            placeholder="Filtrar empresas..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={toggleAll}
          disabled={isInteractiveDisabled}
          className="gp-btn gp-btn-ghost gp-btn-sm"
          style={{ color: "var(--gp-green-text)" }}
        >
          {selectedIds.length === allCompanies.length ? "Quitar todas" : "Seleccionar todas"}
        </button>
      </div>

      <div className="text-[11px] mb-2 tabular-nums" style={{ color: "var(--gp-text-muted)" }}>
        {selectedIds.length} de {allCompanies.length} empresas seleccionadas
      </div>

      <div className="rounded-lg border max-h-72 overflow-y-auto" style={{ borderColor: "var(--gp-border)" }}>
        {visibles.length === 0 ? (
          <div className="p-6 text-center text-[12px]" style={{ color: "var(--gp-text-muted)" }}>
            {allCompanies.length === 0 ? "No hay empresas registradas." : "Ninguna empresa coincide con el filtro."}
          </div>
        ) : (
          visibles.map((company, i) => {
            const checked = selectedIds.includes(company.id);
            return (
              <label
                key={company.id}
                className={`flex items-center gap-3 px-3 py-2.5 transition ${
                  isInteractiveDisabled ? "cursor-default opacity-70" : "cursor-pointer hover:bg-[var(--gp-row-hover)]"
                }`}
                style={{
                  borderTop: i === 0 ? "none" : "1px solid var(--gp-table-border)",
                  backgroundColor: checked && !isInteractiveDisabled ? "rgba(244,249,227,0.6)" : undefined,
                }}
              >
                <input
                  type="checkbox"
                  className="gp-checkbox"
                  checked={checked}
                  onChange={(e) => toggle(company.id, e.target.checked)}
                  disabled={isInteractiveDisabled}
                />
                <span className="text-[13px]" style={{ color: "var(--gp-text-primary)" }}>
                  {company.name}
                </span>
              </label>
            );
          })
        )}
      </div>
    </Modal>
  );
};

// Badge con el conteo de empresas
const PermissionBadge: React.FC<{ count: number; total: number }> = ({ count, total }) => {
  let cls = "gp-badge-neutral";
  if (total === 0) cls = "gp-badge-warning";
  else if (count === total) cls = "gp-badge-success";
  else if (count > 0) cls = "gp-badge-info";
  else cls = "gp-badge-danger";

  return (
    <span className={`gp-badge ${cls}`}>
      <Building2 size={10} />
      {total === 0 ? "Sin empresas" : count === total ? "Todas" : `${count} de ${total}`}
    </span>
  );
};
