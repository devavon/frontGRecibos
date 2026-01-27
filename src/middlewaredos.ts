/* import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) { */
  // 1. Intentamos agarrar el token (JWT) de las cookies
  // Nota: Cambia 'token' por el nombre exacto que use tu backend/frontend
 /*  const token = request.cookies.get('token')?.value;

  const { pathname } = request.nextUrl; */

  // 2. Si el usuario NO tiene token y quiere entrar al Dashboard (carpeta admin)
 /*  if (!token && pathname.startsWith('/')) {
    // Si intenta entrar a la raíz o a cualquier página protegida, lo mandamos al login
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } */

  // 3. Si el usuario YA tiene token e intenta ir al login, lo mandamos al Dashboard
 /*  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}
 */
// 4. Aquí le decimos al portero qué rutas debe vigilar
/* export const config = {
  matcher: [ */
    /*
     * Modificamos la expresión regular para que ignore:
     * - archivos de estilo (.css)
     * - imágenes (.png, .jpg, .jpeg, .gif, .svg)
     * - archivos de JavaScript internos (.js)
     */
/*     '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:css|js|png|jpg|jpeg|gif|svg)$).*)',
 */ /*  ],
}; */