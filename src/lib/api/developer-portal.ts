// Developer Portal — /api/studio/* (note: NOT under /api/v1).
//
// Sub-surfaces:
//   - Service Catalog       — list of platform services
//   - API Sandbox           — execute requests against the gateway
//   - SDK Docs              — auto-generated SDK pages
//   - Health Dashboard      — system health snapshot
//   - Event Catalog         — domain event registry
//   - Component Marketplace — reusable UI components

import { apiClient } from "./client";

// ---- Service Catalog --------------------------------------------------------

export interface ServiceCatalogItem {
  id: string;
  name: string;
  description: string;
  version: string;
  status: string;
}

export const serviceCatalogApi = {
  list(): Promise<ServiceCatalogItem[]> {
    return apiClient.get<ServiceCatalogItem[]>("/api/studio/services/", { tenantId: null });
  },
};

// ---- API Sandbox ------------------------------------------------------------

export type SandboxMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface SandboxRequestInput {
  method: SandboxMethod;
  endpoint: string; // must start with "/"
  headers?: Record<string, string>;
  body?: Record<string, unknown> | null;
}

export interface SandboxResponse {
  status_code: number;
  response: unknown;
}

export const sandboxApi = {
  execute(input: SandboxRequestInput): Promise<SandboxResponse> {
    return apiClient.post<SandboxResponse>("/api/studio/sandbox/", input, { tenantId: null });
  },
};

// ---- SDK Docs ---------------------------------------------------------------
// The route returns a generic catalog payload — keep the type permissive so
// future fields (sample code, language tabs) don't require client changes.

export const sdkDocsApi = {
  list(): Promise<unknown> {
    return apiClient.get("/api/studio/docs/", { tenantId: null });
  },
};

// ---- Health Dashboard -------------------------------------------------------

// Aggregates uptime / latency / error rates / dependency status into a single
// payload. Shape is loose — renderers inspect fields dynamically.
export const healthDashboardApi = {
  get(): Promise<unknown> {
    return apiClient.get("/api/studio/health/", { tenantId: null });
  },
};

// ---- Event Catalog ----------------------------------------------------------

// Catalog of domain events the platform emits, with their schemas.
export const eventCatalogApi = {
  list(): Promise<unknown> {
    return apiClient.get("/api/studio/events/", { tenantId: null });
  },
};

// ---- Component Marketplace --------------------------------------------------

// Reusable UI components surfaced to tenant developers.
export const componentMarketplaceApi = {
  list(): Promise<unknown> {
    return apiClient.get("/api/studio/components/", { tenantId: null });
  },
};
