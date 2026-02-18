import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js middleware to set security headers on all responses.
 * This provides defense-in-depth alongside the backend CSP headers.
 */
export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Content Security Policy
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        `connect-src 'self' ${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"} https:`,
        "media-src 'self' https:",
        "frame-ancestors 'none'",
    ].join("; ");

    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes (handled by backend)
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
