"use client";

import React, { useState, useEffect, useContext, createContext, useMemo } from 'react';
import axios from 'axios'; 

// CRÍTICO: Usamos el puerto 3000 para el backend, como confirmaste.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; 

const AuthContext = createContext();

// Hook personalizado
export const useAuth = () => useContext(AuthContext);

// Proveedor de Autenticación
export const AuthProvider = ({ children }) => {
    // Estados iniciales
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null); // Corregido: La sintaxis de useState debe ser correcta.
    const [isLoading, setIsLoading] = useState(true); 

    /**
     * EFECTO CRÍTICO: Se ejecuta SOLO en el cliente (navegador) para leer localStorage
     * y restaurar la sesión.
     */
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken) {
                setToken(storedToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }

            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Error al parsear el usuario almacenado:", e);
                    localStorage.removeItem('user'); 
                }
            }
        }
        setIsLoading(false);
    }, []);

    // Función de Login
    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const fullUrl = `${API_URL}/api/login`;
            console.log("Intentando iniciar sesión en:", fullUrl);
            
            const response = await axios.post(fullUrl, { email, password }); 
            
            const newToken = response.data.token;
            const userData = response.data.user; 

            if (typeof window !== 'undefined') {
                localStorage.setItem('token', newToken);
                localStorage.setItem('user', JSON.stringify(userData));
            }

            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            
            setToken(newToken);
            setUser(userData);
            
            return response.data;
        } catch (error) {
            console.error(`Fallo en el Login. Asegúrate de que el backend esté corriendo en ${API_URL}`, error.response?.data?.message || error.message);
            logout(); 
            throw error; 
        } finally {
            setIsLoading(false);
        }
    };

    // Función de Logout
    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        delete axios.defaults.headers.common['Authorization'];
        
        setToken(null);
        setUser(null);
    };

    // Memorizamos el valor del contexto
    const contextValue = useMemo(() => ({
        token,
        user,
        isAuthenticated: !!token, 
        isLoading,
        login,
        logout,
    }), [token, user, isLoading]);


    return (
        <AuthContext.Provider value={contextValue}>
            {isLoading ? <div className="p-8 text-center text-gray-500">Verificando sesión...</div> : children}
        </AuthContext.Provider>
    );
};