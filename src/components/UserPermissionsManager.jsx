"use client";

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Building2, Save, UserRound } from 'lucide-react';
import PageHeader from '@/components/gp/PageHeader';

// === CONFIGURACIÓN DE ENDPOINTS ===
// Usamos la URL base para el administrador
const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin`;

// --- COMPONENTE PRINCIPAL ---

export default function UserPermissionsManager() {
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(''); 
    const [userPermissions, setUserPermissions] = useState(new Set()); 
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(''); 

    // --- LÓGICA DE DATOS: Traer datos de las APIs usando Axios ---

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. OBTENER USUARIOS
                const [userResponse, companyResponse] = await Promise.all([
                    axios.get(`${BASE_URL}/users`),
                    // 2. OBTENER EMPRESAS (Usamos 'companies' en plural por convención)
                    axios.get(`${BASE_URL}/companies`)
                ]);

                // Asume que los datos están en response.data
                setUsers(userResponse.data);
                setCompanies(companyResponse.data);

            } catch (error) {
                console.error('Error al cargar datos iniciales con Axios:', error);
                const errorMessage = error.response?.data?.message || error.message;
                setMessage(`❌ Error de conexión: ${errorMessage}. Verifica que tus APIs estén funcionando.`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // 2. Manejar el cambio en el select de usuario
    const handleUserSelect = (e) => {
        // Convierte a número si tus IDs de usuario son numéricos
        const userId = parseInt(e.target.value, 10); 
        setSelectedUserId(userId);
        
        // Cargar los permisos del usuario seleccionado
        const user = users.find(u => u.id === userId);
        if (user && user.permissions) {
            // CRUCIAL: user.permissions debe ser un array de IDs de empresas
            setUserPermissions(new Set(user.permissions));
        } else {
            setUserPermissions(new Set());
        }
        setMessage('');
    };

    // 3. Manejar el cambio de un permiso (checkbox)
    const handleTogglePermission = (companyId) => {
        setUserPermissions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(companyId)) {
                newSet.delete(companyId);
            } else {
                newSet.add(companyId);
            }
            return newSet;
        });
        setMessage('');
    };
    
    // Usuario actualmente seleccionado
    const selectedUser = useMemo(() => 
        users.find(u => u.id === selectedUserId), 
        [users, selectedUserId]
    );

    // 4. Guardar los permisos en el backend (MySQL)
    const handleSavePermissions = async () => {
        if (!selectedUserId) {
            setMessage('Debe seleccionar un usuario para guardar.');
            return;
        }

        setIsSaving(true);
        setMessage('Guardando permisos...');
        
        try {
            const permissionsArray = Array.from(userPermissions);
            
            // 🚨 REAL: Llamada a la API de Next.js/MySQL para guardar los permisos
            // Endpoint: /api/admin/permissions/update
            const response = await axios.post(`${BASE_URL}/permissions/update`, {
                userId: selectedUserId,
                permissions: permissionsArray,
            });
            
            // Axios usa status 2xx para 'ok', no necesita .ok
            if (response.status >= 200 && response.status < 300) {
                setMessage('✅ Permisos actualizados correctamente.');
                
                // Actualizar la lista local de usuarios con los nuevos permisos
                setUsers(prevUsers => prevUsers.map(u => 
                    u.id === selectedUserId 
                        ? { ...u, permissions: permissionsArray } 
                        : u
                ));
            }

        } catch (error) {
            console.error('Error de red/servidor al actualizar permisos:', error);
            const errorMessage = error.response?.data?.message || 'Error de conexión con el servidor.';
            setMessage(`❌ Error al guardar: ${errorMessage}`);
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(''), 5000); 
        }
    };
    
    // --- RENDERIZADO (sistema de diseño Garnier / Gpeople) ---

    if (isLoading) {
        return (
            <div className="gp-card">
                <div className="gp-loading-block">
                    <span className="gp-spinner" />
                    Cargando usuarios y empresas...
                </div>
            </div>
        );
    }

    const esOk = message.startsWith('✅');
    const textoMensaje = message.replace(/^[✅❌]\s*/u, '');

    return (
        <div>
            <PageHeader
                icon={Building2}
                title="Permisos por empresa"
                subtitle="Seleccione un usuario y marque las empresas que puede consultar"
            />

            {/* Selección de usuario */}
            <div className="gp-card p-4 mb-4">
                <label htmlFor="user-select" className="gp-label">Usuario</label>
                <select
                    id="user-select"
                    value={selectedUserId || ''}
                    onChange={handleUserSelect}
                    className="gp-input md:max-w-md"
                >
                    <option value="" disabled>— Seleccione un usuario registrado —</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                        </option>
                    ))}
                </select>
                {users.length === 0 && (
                    <p className="text-[11px] mt-1.5" style={{ color: 'var(--gp-danger-text)' }}>No se encontraron usuarios.</p>
                )}
            </div>

            {/* Asignación */}
            <div className="gp-card">
                <div className="px-4 py-3 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--gp-border)' }}>
                    <h2 className="text-[13px] font-semibold" style={{ color: 'var(--gp-text-primary)' }}>
                        {selectedUser ? `Empresas de ${selectedUser.name}` : 'Empresas disponibles'}
                    </h2>
                    {selectedUser && (
                        <span className="gp-badge gp-badge-neutral tabular-nums">{userPermissions.size} de {companies.length}</span>
                    )}
                </div>

                {!selectedUser ? (
                    <div className="gp-empty">
                        <div className="gp-empty-icon"><UserRound size={26} /></div>
                        <div className="gp-empty-title">Seleccione un usuario</div>
                        <div className="gp-empty-hint">Aparecerán aquí todas las empresas para marcar sus permisos.</div>
                        {companies.length === 0 && (
                            <div className="text-[11px]" style={{ color: 'var(--gp-danger-text)' }}>No se encontraron empresas.</div>
                        )}
                    </div>
                ) : (
                    <div className="p-4">
                        {message && (
                            <div className={`gp-alert ${esOk ? 'gp-alert-success' : message.startsWith('❌') ? 'gp-alert-danger' : 'gp-alert-info'} mb-4`}>
                                {textoMensaje}
                            </div>
                        )}

                        {companies.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[45vh] overflow-y-auto pr-1">
                                {companies.map((company) => {
                                    const checked = userPermissions.has(company.id);
                                    return (
                                        <label
                                            key={company.id}
                                            htmlFor={`company-${company.id}`}
                                            className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition hover:bg-[var(--gp-row-hover)]"
                                            style={{
                                                borderColor: checked ? 'var(--gp-green-mid)' : 'var(--gp-border)',
                                                backgroundColor: checked ? 'var(--gp-green-light)' : 'white',
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                id={`company-${company.id}`}
                                                checked={checked}
                                                onChange={() => handleTogglePermission(company.id)}
                                                className="gp-checkbox"
                                            />
                                            <span className="flex flex-col min-w-0">
                                                <span className="text-[13px] font-medium truncate" style={{ color: 'var(--gp-text-primary)' }}>{company.name}</span>
                                                <span className="text-[10px]" style={{ color: 'var(--gp-text-muted)' }}>
                                                    {company.ruc ? `RUC: ${company.ruc} · ` : ''}ID: {company.id}
                                                </span>
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="gp-empty-hint text-center py-8 mx-auto">No hay empresas disponibles para asignar.</div>
                        )}

                        {companies.length > 0 && (
                            <div className="mt-4 pt-4 border-t flex justify-end" style={{ borderColor: 'var(--gp-border)' }}>
                                <button onClick={handleSavePermissions} disabled={isSaving} className="gp-btn gp-btn-primary">
                                    <Save size={13} /> {isSaving ? 'Guardando...' : 'Guardar permisos'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}