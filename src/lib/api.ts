import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// URL base de tu backend (Ajusta esto si tu backend no es localhost:3000)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/admin'; 

// Crea una instancia de Axios con configuración base
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autorización
// Usamos InternalAxiosRequestConfig para tipar correctamente la configuración.
// NOTA: Forzamos el tipo 'any' en config.headers si es necesario para evitar el error de asignación.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Solución al error: Aseguramos que config.headers sea un objeto antes de asignar
    // Si no existe, lo inicializamos. TypeScript debería permitir esto.
    if (!config.headers) {
        config.headers = {} as any; // Usamos as any como último recurso si el compilador es demasiado estricto
    }

    if (token) {
        // Agregamos el token a los encabezados
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

export { api };
