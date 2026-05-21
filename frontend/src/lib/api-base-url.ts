const DEFAULT_PRODUCTION_API_BASE_URL = "http://localhost:8000";

const LOCAL_HOST_PATTERN =
  /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;

declare global {
  interface Window {
    /** Injected at container start by docker-entrypoint.sh (Railway runtime env). */
    __REGCHECK_API_BASE_URL__?: string;
  }
}

/**
 * Turn env values into an absolute API origin safe for cross-origin deploys.
 *
 * Values like `regcheck-backend` or `/regcheck-backend` (no scheme) become relative
 * URLs on the frontend host unless normalized to `https://…`.
 */
export function normalizeApiBaseUrl(raw: string, allowRelative = false): string {
  let value = raw.trim().replace(/\/+$/, "");
  if (!value) {
    return "";
  }

  // `/regcheck-backend` is often a mistaken path prefix — treat as hostname.
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
  const runtime = window.__REGCHECK_API_BASE_URL__?.trim();
  return runtime || undefined;
}

export function resolveApiBaseUrl(
  buildTimeValue: string | undefined,
  dev: boolean,
): string {
  const runtime = readRuntimeApiBaseUrl();
  if (runtime) {
    const normalized = normalizeApiBaseUrl(runtime, dev);
    if (normalized) {
      return normalized;
    }
  }

  const trimmed = buildTimeValue?.trim();
  if (!trimmed) {
    return dev ? "" : DEFAULT_PRODUCTION_API_BASE_URL;
  }

  const normalized = normalizeApiBaseUrl(trimmed, dev);
  return normalized || (dev ? "" : DEFAULT_PRODUCTION_API_BASE_URL);
}

/** Resolved backend origin used for all API calls. */
export function getApiBaseUrl(): string {
  return resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL, import.meta.env.DEV);
}

/** Join API origin and path (`/api/v1/...`) as an absolute URL when possible. */
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
    if (import.meta.env.DEV) {
      return `${absoluteBase}${normalizedPath}`;
    }
    console.error(
      `[regcheck] API base URL "${baseUrl}" is not absolute. ` +
        "Set REGCHECK_API_BASE_URL to your backend URL (e.g. https://your-backend.up.railway.app).",
    );
    return normalizedPath;
  }

  return new URL(normalizedPath, `${absoluteBase}/`).href;
}
