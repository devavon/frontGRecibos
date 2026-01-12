"use client";

import React, { useState, useEffect, useContext, createContext, useMemo } from 'react';
import axios from 'axios'; 
import Cookies from 'js-cookie'; // Para que el Middleware pueda ver el token
import { useRouter } from 'next/navigation'; // Para mover al usuario de página

// CRÍTICO: Usamos el puerto 3000 para el backend, como confirmaste.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; 

const AuthContext = createContext();

// Hook personalizado
export const useAuth = () => useContext(AuthContext);

// Proveedor de Autenticación
export const AuthProvider = ({ children }) => {
    const router = useRouter(); // <--- AÑADE ESTA LÍNEA AQUÍ
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
            const response = await axios.post(fullUrl, { email, password }); 
            
            const newToken = response.data.token;
            const userData = response.data.user; 

            if (typeof window !== 'undefined') {
                localStorage.setItem('token', newToken);
                localStorage.setItem('user', JSON.stringify(userData));
                
                // --- NUEVO: Esto es para el Middleware ---
                /* Cookies.set('token', newToken, { expires: 1 }); // Guarda el token en cookies por 1 día */
                Cookies.set('token', newToken);
            }

            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            
            setToken(newToken);
            setUser(userData);
            
            // --- NUEVO: Esto te lleva al Dashboard automáticamente ---
            router.push('/'); 
            
            return response.data;
        } catch (error) {
            // ... tu código de error se queda igual
        } finally {
            setIsLoading(false);
        }
    };

    // Función de Logout
    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            Cookies.remove('token'); // <--- NUEVO: Borra la cookie también
        }
        delete axios.defaults.headers.common['Authorization'];
        
        setToken(null);
        setUser(null);
        
        // Opcional: mandarlo al login al cerrar sesión
        router.push('/login');
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