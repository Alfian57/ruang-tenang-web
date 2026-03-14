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

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
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

export default process.env.NODE_ENV === "production"
  ? withSerwist(nextConfig)
  : nextConfig;
