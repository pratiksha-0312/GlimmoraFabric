// HTTP client for the FastAPI backend.
//
// Features:
//   - Automatic Authorization header from in-memory access token
//   - Single-flight refresh: 401 triggers exactly one refresh, queued requests retry once
//   - Standardized error handling (throws ApiError with status, message, request_id)
//   - Unwraps the backend's { success, data, error, ... } envelope so callers receive `data` directly

import { tenantStorage } from "./tenant-storage";
import { tokenStorage } from "./token-storage";
import { ApiError, type ApiEnvelope } from "./types";

const DEFAULT_BASE_URL = "http://localhost:8000";

declare const process: { env: Record<string, string | undefined> } | undefined;

function getBaseUrl(): string {
  const env =
    typeof process !== "undefined" && process?.env
      ? process.env.NEXT_PUBLIC_API_BASE_URL
      : undefined;
  return (env ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  // If true, do NOT attach Authorization header — for login, signup, etc.
  skipAuth?: boolean;
  // If true, do NOT attempt token refresh on 401 — used by the refresh call itself.
  skipRefresh?: boolean;
  // Override or disable the auto-injected X-Tenant-ID. Pass `null` to suppress.
  tenantId?: string | null;
  headers?: Record<string, string>;
  // Override response handling — return raw Response (e.g., for file downloads).
  raw?: boolean;
  signal?: AbortSignal;
}

let refreshInFlight: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refresh = tokenStorage.getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${getBaseUrl()}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (!res.ok) {
      tokenStorage.clear();
      return null;
    }

    const env = (await res.json()) as ApiEnvelope<{
      access_token: string;
      refresh_token: string;
    }>;

    if (!env.success || !env.data) {
      tokenStorage.clear();
      return null;
    }

    tokenStorage.rotateTokens({
      accessToken: env.data.access_token,
      refreshToken: env.data.refresh_token,
    });
    return env.data.access_token;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

function buildQuery(query: RequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = `${getBaseUrl()}${path}${buildQuery(opts.query)}`;
  const headers: Record<string, string> = { ...(opts.headers ?? {}) };

  if (opts.body !== undefined && !(opts.body instanceof FormData)) {
    headers["Content-Type"] ??= "application/json";
  }

  if (!opts.skipAuth) {
    const access = tokenStorage.getAccessToken();
    if (access) headers["Authorization"] = `Bearer ${access}`;
  }

  // Auto-inject X-Tenant-ID. Caller can override per-request or pass `null`
  // to suppress (e.g. for the cross-tenant Tenants admin endpoints).
  if (opts.tenantId !== null) {
    const tenant = opts.tenantId ?? tenantStorage.get();
    if (tenant && !headers["X-Tenant-ID"]) {
      headers["X-Tenant-ID"] = tenant;
    }
  }

  const init: RequestInit = {
    method: opts.method ?? "GET",
    headers,
    signal: opts.signal,
  };

  if (opts.body !== undefined) {
    init.body =
      opts.body instanceof FormData
        ? opts.body
        : JSON.stringify(opts.body);
  }

  let res = await fetch(url, init);

  // Single-flight refresh on 401 (except for the refresh call itself or pre-auth calls)
  if (res.status === 401 && !opts.skipAuth && !opts.skipRefresh) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, { ...init, headers });
    }
  }

  if (opts.raw) {
    return res as unknown as T;
  }

  // Try to parse JSON either way; backend always returns the envelope on errors too.
  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // non-JSON response
  }

  if (!res.ok || (payload && payload.success === false)) {
    throw new ApiError(
      payload?.message || `Request failed (${res.status})`,
      {
        status: res.status,
        code: payload?.error ?? undefined,
        requestId: payload?.request_id,
      },
    );
  }

  // Some endpoints return data: null with success: true — normalize to {} as T
  return (payload?.data ?? ({} as T)) as T;
}

export const apiClient = {
  get<T>(path: string, opts?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return request<T>(path, { ...opts, method: "GET" });
  },
  post<T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return request<T>(path, { ...opts, method: "POST", body });
  },
  put<T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return request<T>(path, { ...opts, method: "PUT", body });
  },
  patch<T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return request<T>(path, { ...opts, method: "PATCH", body });
  },
  delete<T>(path: string, opts?: Omit<RequestOptions, "method">): Promise<T> {
    return request<T>(path, { ...opts, method: "DELETE" });
  },
  refresh: refreshAccessToken,
  baseUrl: getBaseUrl,
};
