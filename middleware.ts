import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Si NO hay token → redirige al login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Rutas protegidas
export const config = {
  matcher: [
    "/",               // página principal
    "/dashboard/:path*",  // si tienes dashboard
    "/datos/:path*",      // agrega más si es necesario
  ],
};
