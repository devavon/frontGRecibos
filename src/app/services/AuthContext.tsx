import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Simulamos la importación de axios y la URL de la API. Reemplaza esto con tu configuración real.
// import axios from 'axios';
const API_URL = '/api/auth/login'; // Reemplaza con tu endpoint de login

// --- Interfaces de Tipado ---

interface User {
  id: string;
  role: 'Administrador' | 'Editor' | 'Lector' | 'Desconocido';
  companyId?: string; 
  token: string; // El token es esencial
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  isLector: boolean; // Agregamos un chequeo de rol
}

// Valores iniciales
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Función de Simulación de Llamada a la API ---
// *****************************************************************
// IMPORTANTE: DEBES REEMPLAZAR ESTA FUNCIÓN CON TU LLAMADA REAL A AXIOS
// *****************************************************************

const performLoginRequest = async (email: string, password: string): Promise<{ token: string; user_id: string; role: string; company_id?: string }> => {
    // ⚠️ REEMPLAZA ESTA LÓGICA CON TU LLAMADA REAL A AXIOS
    // Ej: const response = await axios.post(API_URL, { email, password });
    // return response.data;
    
    // SIMULACIÓN (Borrar después de reemplazar):
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula latencia de red

    if (email === 'admin@empresa.com' && password === '1234') {
        return {
            token: 'admin_token_123',
            user_id: 'u001',
            role: 'Administrador',
            company_id: 'CMP000' // Opcional para Admin
        };
    } else if (email === 'lector@empresaA.com' && password === '1234') {
        return {
            token: 'lector_token_456',
            user_id: 'u002',
            role: 'Lector',
            company_id: 'EMPRESA_A' // Clave para filtrar facturas
        };
    } else if (email === 'editor@empresaB.com' && password === '1234') {
        return {
            token: 'editor_token_789',
            user_id: 'u003',
            role: 'Editor',
            company_id: 'EMPRESA_B'
        };
    } else {
        throw new Error('Credenciales inválidas. Revise su email y contraseña.');
    }
};

// --- Componente Proveedor del Contexto ---

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carga la sesión desde localStorage al montar el componente
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error al parsear usuario de localStorage:", e);
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Función de Login que ahora maneja la llamada a la API
  const login = useCallback(async (email: string, password: string) => {
    try {
        const apiResponse = await performLoginRequest(email, password);
        
        // Normalizar el rol
        const normalizedRole: User['role'] = (apiResponse.role === 'Administrador' || apiResponse.role === 'Editor' || apiResponse.role === 'Lector')
            ? apiResponse.role
            : 'Desconocido';

        const userData: User = {
            id: apiResponse.user_id,
            role: normalizedRole,
            companyId: apiResponse.company_id,
            token: apiResponse.token
        };

        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        return { success: true };

    } catch (error: any) {
        console.error("Error en el login:", error.message);
        return { success: false, message: error.message || 'Error desconocido al iniciar sesión.' };
    }
  }, []);

  // Función de Logout
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('auth_user');
  }, []);

  const isAuthenticated = !!user;
  const isLoggedIn = isAuthenticated;
  const isAdmin = user?.role === 'Administrador';
  const isLector = user?.role === 'Lector'; // Nuevo

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    isAdmin,
    isLoggedIn,
    isLoading,
    isLector, // Nuevo
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// --- Hook Personalizado ---

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};