import { z } from "zod";

/**
 * Validated environment variables.
 * Uses Zod to parse and validate env on boot - fail fast on misconfiguration.
 *
 * Usage: import { env } from "@/config/env";
 *        env.NEXT_PUBLIC_API_BASE_URL
 */

const API_BASE_PLACEHOLDER = "__NEXT_PUBLIC_API_BASE_URL__";
const LOCAL_API_DEFAULT = "http://localhost:8080/api/v1";

/**
 * Resolve the effective API base URL for the current runtime.
 *
 * The browser bundle can end up with a value that is unusable for the page
 * it is actually served from:
 *  - an unreplaced runtime placeholder (`__NEXT_PUBLIC_API_BASE_URL__`), or
 *  - the localhost dev default baked in at build time.
 *
 * When that happens on a non-localhost page (e.g. a deployed site), calls to
 * `http://localhost:8080` are unreachable and the PWA service worker reports
 * `no-response` errors. In that case we fall back to the page's own origin,
 * which matches the production topology (API served same-origin at /api/v1).
 *
 * Genuine local development (page on localhost) and any explicitly configured
 * absolute URL are left untouched.
 */
function resolveApiBaseUrl(raw: string | undefined): string {
  const value = raw && raw.trim() ? raw.trim() : LOCAL_API_DEFAULT;

  // Server-side / build-time: keep the value as-is (no window available).
  // An unreplaced placeholder (shape: __SOMETHING__) is preserved so the
  // runtime entrypoint sed-injection can still replace it.
  if (typeof window === "undefined") {
    return /^__.*__$/.test(value) ? API_BASE_PLACEHOLDER : value;
  }

  const isUnreplacedPlaceholder = /^__.*__$/.test(value);

  let pointsToLocalhost = false;
  try {
    const host = new URL(value).hostname;
    pointsToLocalhost = host === "localhost" || host === "127.0.0.1";
  } catch {
    // Not an absolute URL — treat as needing origin resolution.
    pointsToLocalhost = true;
  }

  const pageHost = window.location.hostname;
  const pageIsLocalhost = pageHost === "localhost" || pageHost === "127.0.0.1";

  // Only override when the configured target is unusable for this page.
  if (isUnreplacedPlaceholder || (pointsToLocalhost && !pageIsLocalhost)) {
    return `${window.location.origin}/api/v1`;
  }

  return value;
}

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .default(LOCAL_API_DEFAULT)
    .transform((val) => resolveApiBaseUrl(val)),
  NEXT_PUBLIC_APP_TIMEZONE: z.string().default("Asia/Jakarta"),
  NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS: z.string().default("ruang-tenang.site,localhost,127.0.0.1"),
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string().default(""),
  NEXT_PUBLIC_MIDTRANS_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_TIMEZONE: process.env.NEXT_PUBLIC_APP_TIMEZONE,
  NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS: process.env.NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS,
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
  NEXT_PUBLIC_MIDTRANS_ENV: process.env.NEXT_PUBLIC_MIDTRANS_ENV,
  NODE_ENV: process.env.NODE_ENV,
});
