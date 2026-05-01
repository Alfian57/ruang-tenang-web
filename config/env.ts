import { z } from "zod";

/**
 * Validated environment variables.
 * Uses Zod to parse and validate env on boot - fail fast on misconfiguration.
 *
 * Usage: import { env } from "@/config/env";
 *        env.NEXT_PUBLIC_API_BASE_URL
 */

const API_BASE_PLACEHOLDER = "__NEXT_PUBLIC_API_BASE_URL__";

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .default("http://localhost:8080/api/v1")
    .transform((val) =>
      val === "__NEXT_PUBLIC_API_URL__" || val === API_BASE_PLACEHOLDER
        ? API_BASE_PLACEHOLDER
        : val
    ),
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
