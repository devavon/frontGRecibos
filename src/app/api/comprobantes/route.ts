// src/app/api/comprobantes/route.ts - En la carpeta del FRONTEND (Next.js)

import { NextResponse } from 'next/server';

// **¡IMPORTANTE!** Lee la URL de tu backend de datos desde .env.local
const BACKEND_DATA_URL = process.env.BACKEND_DATA_URL; 

export async function GET(request: Request) {
  if (!BACKEND_DATA_URL) {
    return NextResponse.json({ 
        success: false, 
        message: 'Falta la configuración BACKEND_DATA_URL en .env.local.' 
    }, { status: 500 });
  }
  
  try {
    // 1. Llama al endpoint de Express (http://localhost:3000/facturas)
    const response = await fetch(BACKEND_DATA_URL, {
        cache: 'no-store' 
    });

    if (!response.ok) {
        // Reenvía cualquier error que venga de tu backend de Express (ej: 500)
        console.error(`Error del Backend de Datos (Express): ${response.status}`);
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
    }

    // 2. Lee y ajusta la respuesta.
    const expressData = await response.json();
    
    // Lo empaquetamos en el formato {success: true, data: [...]}
    const finalData = {
        success: true,
        data: expressData
    };
    
    return NextResponse.json(finalData, { status: 200 });

  } catch (error) {
    console.error("Error al hacer proxy al Backend de Datos:", error);
    return NextResponse.json({ 
      success: false,
      message: 'No se pudo conectar al servicio de datos (Proxy Fallido).' 
    }, { status: 503 });
  }
}