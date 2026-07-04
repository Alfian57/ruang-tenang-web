import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "./config/env";

type Role = "admin" | "user" | "mitra";

const AUTH_COOKIE = "auth-storage";

/**
 * Best-effort decode of the persisted auth state cookie (zustand persist).
 * Returns role + auth flag, or null when the cookie is missing/unparseable.
 * This is defense-in-depth only; the Go backend remains the source of truth.
 */
function readAuthFromCookie(request: NextRequest): { role: Role | null; isAuthenticated: boolean } | null {
    const raw = request.cookies.get(AUTH_COOKIE)?.value;
    if (!raw) return null;
    try {
        // Cookie may be URI-encoded JSON.
        const decoded = decodeURIComponent(raw);
        const parsed = JSON.parse(decoded) as {
            state?: { user?: { role?: Role }; isAuthenticated?: boolean };
        };
        return {
            role: parsed.state?.user?.role ?? null,
            isAuthenticated: Boolean(parsed.state?.isAuthenticated),
        };
    } catch {
        return null;
    }
}

/**
 * Returns the path the request should be redirected to when the role is not
 * allowed for the requested route, or null when access is permitted.
 */
function getRoleRedirect(pathname: string, role: Role | null, isAuthenticated: boolean): string | null {
    const isAdminPath = pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/")
        || pathname === "/dashboard/moderation" || pathname.startsWith("/dashboard/moderation/");
    const isMitraPath = pathname === "/dashboard/mitra" || pathname.startsWith("/dashboard/mitra/");

    if (!isAdminPath && !isMitraPath) return null;

    // No readable session: let client-side AuthProvider handle login redirect.
    if (!isAuthenticated || !role) return null;

    if (isAdminPath && role !== "admin") return "/dashboard";
    if (isMitraPath && role !== "mitra") return "/dashboard";

    return null;
}

/**
 * Next.js middleware to enforce role-based access on admin/mitra dashboard
 * routes at the edge, and to set security headers on all responses.
 * This provides defense-in-depth alongside the backend role middleware.
 */
export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Server-side role guard for admin/mitra dashboard segments.
    const auth = readAuthFromCookie(request);
    const redirectTarget = getRoleRedirect(pathname, auth?.role ?? null, auth?.isAuthenticated ?? false);
    if (redirectTarget && redirectTarget !== pathname) {
        return NextResponse.redirect(new URL(redirectTarget, request.url));
    }

    const response = NextResponse.next();

    // Content Security Policy
    // Extract origin from API URL so CSP allows all subpaths (e.g. /api/v1/articles)
    const apiUrl = env.NEXT_PUBLIC_API_BASE_URL;
    let apiOrigin = request.nextUrl.origin;
    try {
        apiOrigin = new URL(apiUrl).origin;
    } catch {
        // Keep same-origin fallback when API env URL is invalid.
    }

    const midtransAppOrigin = env.NEXT_PUBLIC_MIDTRANS_ENV === "production"
        ? "https://app.midtrans.com"
        : "https://app.sandbox.midtrans.com";
    const midtransApiOrigin = env.NEXT_PUBLIC_MIDTRANS_ENV === "production"
        ? "https://api.midtrans.com"
        : "https://api.sandbox.midtrans.com";

    const csp = [
        "default-src 'self'",
        `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com ${midtransAppOrigin}`,
        `script-src-elem 'self' 'unsafe-inline' https://static.cloudflareinsights.com ${midtransAppOrigin}`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        `img-src 'self' data: blob: https: http: ${apiOrigin}`,
        `connect-src 'self' ${apiOrigin} ${midtransAppOrigin} ${midtransApiOrigin} https:`,
        `media-src 'self' https: http: ${apiOrigin}`,
        `frame-src 'self' ${midtransAppOrigin}`,
        "frame-ancestors 'none'",
        "worker-src 'self'",
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
        "/((?!api|_next/static|_next/image|favicon.ico|sw\\.js|swe-worker|workbox).*)",
    ],
};
