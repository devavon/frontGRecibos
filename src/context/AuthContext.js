"use client"

import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

// 1. Crear el contexto
const AuthContext = createContext();

// URL de tu API de Node.js
const API_URL = 'http://localhost:3000'; 

export const AuthProvider = ({ children }) => {
    // 2. Estado: Cargar token desde el almacenamiento local si existe
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [user, setUser] = useState(null); 

    // 3. Función de Login
    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            const newToken = response.data.token;
            
            setToken(newToken); 
            localStorage.setItem('token', newToken); 
            
            // Aquí podrías decodificar el token o hacer otra llamada para obtener el nombre del usuario
            setUser({ email }); 

            return { success: true, message: "Login exitoso" };
        } catch (error) {
            console.error("Error en login:", error.response?.data || error.message);
            setToken(null);
            localStorage.removeItem('token');
            setUser(null);
            return { success: false, message: error.response?.data?.error || "Error de credenciales" };
        }
    };

    // 4. Función de Logout
    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
        setUser(null);
    };

    // 5. Proveedor de contexto que envuelve la aplicación
    return (
        <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

// 6. Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);