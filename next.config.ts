import type { NextConfig } from "next";

// Parse API URL for dynamic configuration
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";
const apiBaseUrl = apiUrl.replace(/\/api\/v1$/, ""); // Remove /api/v1 suffix

// Parse the URL to get components
const parseUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return {
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      port: parsed.port || "",
    };
  } catch {
    return { protocol: "http" as const, hostname: "localhost", port: "8080" };
  }
};

const apiParsed = parseUrl(apiBaseUrl);

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: apiParsed.protocol,
        hostname: apiParsed.hostname,
        port: apiParsed.port,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
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

export default nextConfig;
