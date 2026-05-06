// Hierarchical config — /api/v1/config. Resolution order: TENANT > PRODUCT > GLOBAL.

import { apiClient } from "./client";

export type ConfigLevel = "GLOBAL" | "PRODUCT" | "TENANT";

export interface ResolvedConfig {
  key: string;
  value: string;
  resolved_level: ConfigLevel;
}

export interface SetConfigInput {
  key: string;
  // Strings, numbers, booleans, and JSON-serializable objects are all OK —
  // the backend serialises them on write.
  value: unknown;
  description?: string;
  level?: ConfigLevel;
}

export interface SetConfigResult {
  key: string;
  value: string;
  description: string;
  level: ConfigLevel;
  is_active: boolean;
}

export const configApi = {
  // Resolve a config key. Pass `product_id` and/or `tenant_id` to scope
  // resolution; omit both for the GLOBAL value.
  get(params: {
    key: string;
    product_id?: string;
    tenant_id?: string;
  }): Promise<ResolvedConfig> {
    return apiClient.get<ResolvedConfig>("/api/v1/config", {
      query: params as Record<string, unknown>,
      // Internal endpoint — accepts an explicit tenant_id query parameter, so
      // don't auto-attach the X-Tenant-ID header.
      tenantId: null,
    });
  },

  set(input: SetConfigInput): Promise<SetConfigResult> {
    return apiClient.put<SetConfigResult>("/api/v1/config", { level: "GLOBAL", ...input }, {
      tenantId: null,
    });
  },
};
