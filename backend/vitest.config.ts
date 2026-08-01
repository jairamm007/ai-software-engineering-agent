import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["src/__tests__/setup-env.ts"],
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    exclude: ["src/tests/**", "node_modules", "dist"],

    testTimeout: 30000,
    hookTimeout: 15000,

    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: [
        "src/tests/**",
        "src/**/*.test.ts",
        "src/**/*.spec.ts",
        "node_modules",
        "dist",
      ],
      thresholds: {
        statements: 50,
        branches: 40,
        functions: 50,
        lines: 50,
      },
    },

    reporters: ["verbose"],
    outputFile: {
      json: "./test-results.json",
    },

    sequence: {
      shuffle: false,
    },

    pool: "forks",
  },
});
