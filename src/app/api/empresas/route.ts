import { NextResponse } from 'next/server';
import axios from 'axios';

// URL base de tu backend de Express
const EXPRESS_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(request: Request) {
    // Extraer el token de autorización de la solicitud entrante
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
        return NextResponse.json(
            { success: false, message: "Token de autorización no proporcionado." },
            { status: 401 }
        );
    }

    try {
        // Reenviar la solicitud al backend de Express
        const response = await axios.get(`${EXPRESS_API_URL}/empresas`, {
            headers: {
                Authorization: authHeader // Reenviar el token al backend
            }
        });

        // El backend de Express debería devolver un array de strings (las empresas)
        // Devolvemos la respuesta tal cual
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.error("Error en el proxy de empresas:", error);
        
        // Manejo de errores de Axios o de red
        if (axios.isAxiosError(error) && error.response) {
            return NextResponse.json(
                { success: false, message: error.response.data?.message || "Error al conectar con la API de Express." },
                { status: error.response.status }
            );
        }
        
        return NextResponse.json(
            { success: false, message: "Error interno del servidor de proxy." },
            { status: 500 }
        );
    }
}