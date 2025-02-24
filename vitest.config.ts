/// <reference types="vitest" />
/// <reference types="vite/client" />

import { resolve } from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [
      "./src/test/vitest-setup.ts",
      "./src/tests/utils/test-setup.ts",
      "./src/tests/utils/test-matchers.ts",
    ],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/test/**/*",
        "src/tests/**/*",
        "src/types/**/*",
      ],
    },
    deps: {
      inline: [
        "@testing-library/jest-dom",
        "@testing-library/react",
        "@testing-library/user-event",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
