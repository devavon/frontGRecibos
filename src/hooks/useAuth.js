'use client'; // Necesario para hooks en Next.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Crear el Contexto
// Se inicializa con 'null' o un objeto que coincida con el valor del provider
const AuthContext = createContext(null);

// 2. Definir la Función del Hook (Provider)
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // Se usa para manejar el estado de carga

    // Carga el token y los datos del usuario del localStorage al iniciar
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user'); // <-- Lee el usuario

        if (storedToken && storedUser) {
            setToken(storedToken);
            // CRÍTICO: Parsear el string JSON a un objeto y establecer el estado del usuario
            setUser(JSON.parse(storedUser)); 
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, { email, password });
            const { token, user } = response.data;
            
            localStorage.setItem('token', token);
            
            // 🚨 ESTA ES LA LÍNEA CRÍTICA Y CORREGIDA 🚨
            // Guarda el objeto 'user' como una cadena JSON en localStorage para que persista.
            localStorage.setItem('user', JSON.stringify(user)); 

            setToken(token);
            setUser(user);
            
            return true;
        } catch (error) {
             // Puedes añadir lógica para manejar errores de login (ej: setError)
            console.error("Login failed:", error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // Limpia el usuario del storage al cerrar sesión
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// 3. Hook para Consumir el Contexto (el que importan tus componentes)
export const useAuth = () => {
    return useContext(AuthContext);
};