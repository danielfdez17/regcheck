import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const frontendDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(frontendDir, "..");

function resolveDevProxyTarget(apiBaseUrl: string | undefined): string {
  const trimmed = apiBaseUrl?.trim();
  if (!trimmed) {
    return "http://localhost:8000";
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, "");
  }
  if (trimmed.startsWith("/")) {
    return "http://localhost:8000";
  }
  const scheme = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(trimmed) ? "http" : "https";
  return `${scheme}://${trimmed.replace(/\/+$/, "")}`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, "");
  const isProductionBuild = mode === "production";
  const devApiBaseUrl =
    env.VITE_API_BASE_URL?.trim() || "http://localhost:8000";

  return {
    envDir: repoRoot,
    plugins: [react()],
    define: isProductionBuild
      ? { "import.meta.env.VITE_API_BASE_URL": JSON.stringify("") }
      : undefined,
    server: {
      host: "0.0.0.0",
      port: 3001,
      strictPort: true,
    },
    preview: {
      host: "0.0.0.0",
      port: 3001,
      strictPort: true,
      proxy: {
        "/api": {
          target: resolveDevProxyTarget(devApiBaseUrl),
          changeOrigin: true,
        },
      },
    },
  };
});
