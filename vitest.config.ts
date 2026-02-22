import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/components/**/*.{test,spec}.{ts,tsx}", "tests/unit/**/*.{test,spec}.{ts,tsx}"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["components/**/*.{ts,tsx}", "utils/**/*.{ts,tsx}", "services/schema/**/*.{ts,tsx}"],
      thresholds: {
        lines: 10,
        statements: 10,
        functions: 9,
        branches: 8,
      },
    },
  },
});
