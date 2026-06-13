import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "netlify/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@lib": new URL("./src/lib", import.meta.url).pathname,
    },
  },
});
