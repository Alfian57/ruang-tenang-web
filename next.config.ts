import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";
import { env } from "./config/env";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

// Parse API URL for dynamic configuration
const apiUrl = env.NEXT_PUBLIC_API_BASE_URL;
const apiBaseUrl = apiUrl.replace(/\/api\/v1$/, ""); // Remove /api/v1 suffix
type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

function parseRemotePattern(value: string): RemotePattern | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;

    return {
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      port: parsed.port,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

function uniqueRemotePatterns(patterns: Array<RemotePattern | null>): RemotePattern[] {
  const seen = new Set<string>();
  const result: RemotePattern[] = [];

  for (const pattern of patterns) {
    if (!pattern) continue;
    const key = `${pattern.protocol}:${pattern.hostname}:${pattern.port ?? ""}:${pattern.pathname ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(pattern);
  }

  return result;
}

const configuredImageHosts = env.NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const imageRemotePatterns = uniqueRemotePatterns([
  parseRemotePattern(apiBaseUrl),
  ...configuredImageHosts.map(parseRemotePattern),
  ...configuredImageHosts
    .filter((host) => host === "localhost" || host === "127.0.0.1" || host.startsWith("localhost:") || host.startsWith("127.0.0.1:"))
    .map((host) => parseRemotePattern(`http://${host}`)),
]);

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: imageRemotePatterns,
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${apiBaseUrl}/uploads/:path*`,
      },
    ];
  },
  productionBrowserSourceMaps: true,
};

export default process.env.NODE_ENV === "production"
  ? withSerwist(nextConfig)
  : nextConfig;
