import { NextResponse } from 'next/server';
import axios from 'axios';

// URL base de tu backend de Express
const EXPRESS_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET() {
    // Nota: Aunque el token se maneja en el frontend, mantenemos la estructura simple para evitar
    // errores de "Next.js API Routes don't have access to window/localStorage"
    
    try {
        // Reenviar la solicitud al backend de Express
        const response = await axios.get(`${EXPRESS_API_URL}/proveedores`);

        // Devolver la respuesta de Express directamente. Status 200 asegura que se procese el cuerpo de la respuesta.
        return NextResponse.json(response.data, { status: 200 });
        
    } catch (error) {
        console.error("Error en el proxy de proveedores:", error);
        return NextResponse.json(
            { success: false, message: "Error al obtener proveedores a través del proxy." },
            { status: 500 }
        );
    }
}