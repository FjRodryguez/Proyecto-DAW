import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function parseJwt(token: string) {
    try {
        const base64Payload = token.split(".")[1];
        return JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    } catch {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("token")?.value;

    // Rutas protegidas por rol admin
    if (pathname.startsWith("/admin")) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        const payload = parseJwt(token);

        if (!payload || payload.id_rol !== 3) {
            return NextResponse.redirect(new URL("/404", request.url));
        }

        return NextResponse.next();
    }

    // Rutas protegidas solo por login
    if (pathname.startsWith("/crea-entrenamientos")) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Si quieres, puedes validar token un poco más aquí (expiración, etc.)
        return NextResponse.next();
    }

    // Para todas las demás rutas, dejamos pasar
    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/crea-entrenamientos/:path*"],
};
