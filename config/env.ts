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
      val === "__NEXT_PUBLIC_API_URL__"
        ? API_BASE_PLACEHOLDER
        : val
    ),
  NEXT_PUBLIC_APP_TIMEZONE: z.string().default("Asia/Jakarta"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_TIMEZONE: process.env.NEXT_PUBLIC_APP_TIMEZONE,
  NODE_ENV: process.env.NODE_ENV,
});
