const DEFAULT_DEV_API_BASE_URL = "http://localhost:8000";

const LOCAL_HOST_PATTERN =
  /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;

declare global {
  interface Window {
    /** Production deploy: empty = same-origin /api via nginx proxy. */
    __REGCHECK_API_BASE_URL__?: string;
  }
}

function isLocalBrowserHost(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const hostname = window.location.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function normalizeApiBaseUrl(raw: string, allowRelative = false): string {
  let value = raw.trim().replace(/\/+$/, "");
  if (!value) {
    return "";
  }

  if (value.startsWith("/") && !value.startsWith("/api")) {
    value = value.slice(1);
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return allowRelative ? value : "";
  }

  const scheme = LOCAL_HOST_PATTERN.test(value) ? "http" : "https";
  return `${scheme}://${value}`;
}

function readRuntimeApiBaseUrl(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  if (typeof window.__REGCHECK_API_BASE_URL__ === "string") {
    return window.__REGCHECK_API_BASE_URL__;
  }
  return undefined;
}

/**
 * - Dev (`make dev`): direct calls to VITE_API_BASE_URL (backend on host).
 * - Prod Docker / Railway: same-origin `/api` (nginx proxy).
 * - Local prod without Docker (`make preview`): direct calls to backend on host.
 */
export function getApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
    if (fromEnv) {
      return normalizeApiBaseUrl(fromEnv, true) || DEFAULT_DEV_API_BASE_URL;
    }
    return DEFAULT_DEV_API_BASE_URL;
  }

  const runtime = readRuntimeApiBaseUrl();
  if (runtime !== undefined && runtime.trim()) {
    return normalizeApiBaseUrl(runtime);
  }

  // Same-origin /api proxy (nginx on Railway or make up).
  if (runtime !== undefined && !runtime.trim() && !isLocalBrowserHost()) {
    return "";
  }

  // Local production (vite preview or static on localhost): talk to backend on host.
  if (isLocalBrowserHost()) {
    return DEFAULT_DEV_API_BASE_URL;
  }

  return "";
}

export function buildApiUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!baseUrl) {
    return normalizedPath;
  }

  const absoluteBase = normalizeApiBaseUrl(baseUrl, import.meta.env.DEV);
  if (!absoluteBase) {
    return normalizedPath;
  }

  if (!/^https?:\/\//i.test(absoluteBase)) {
    return `${absoluteBase}${normalizedPath}`;
  }

  return new URL(normalizedPath, `${absoluteBase}/`).href;
}
