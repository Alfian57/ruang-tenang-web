import { env } from "@/config/env";

/**
 * Resolves a relative upload path to a full URL.
 * If the path is already an absolute URL (http/https), it is returned as-is.
 */
export function getUploadUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const baseUrl = env.NEXT_PUBLIC_API_BASE_URL;

  // Remove /api/v1 from the base URL for uploads
  let uploadBaseUrl = baseUrl.includes("/api/v1")
    ? baseUrl.replace("/api/v1", "")
    : baseUrl;

  // Remove trailing slash if present
  if (uploadBaseUrl.endsWith("/")) {
    uploadBaseUrl = uploadBaseUrl.slice(0, -1);
  }

  // Ensure absolute URL
  if (!uploadBaseUrl.startsWith("http")) {
    uploadBaseUrl = "http://localhost:8080";
  }

  // Ensure path starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${uploadBaseUrl}${cleanPath}`;
}
