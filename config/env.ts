import { z } from "zod";

/**
 * Validated environment variables.
 * Uses Zod to parse and validate env on boot - fail fast on misconfiguration.
 *
 * Usage: import { env } from "@/config/env";
 *        env.NEXT_PUBLIC_API_BASE_URL
 */

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .default("http://localhost:8080/api/v1")
    .transform((val) =>
      val === "__NEXT_PUBLIC_API_BASE_URL__"
        ? "http://localhost:8080/api/v1"
        : val
    ),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
});
