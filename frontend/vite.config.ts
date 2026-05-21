import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

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
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = resolveDevProxyTarget(env.VITE_API_BASE_URL);

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 3001,
      strictPort: true,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: "0.0.0.0",
      port: 3001,
      strictPort: true,
    },
  };
});
