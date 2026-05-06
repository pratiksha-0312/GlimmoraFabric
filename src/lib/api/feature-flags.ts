// Feature Flags — /api/v1/feature-flags/*. Cross-tenant Super-Admin surface,
// so we suppress X-Tenant-ID. Per-tenant overrides nest under each flag.

import { apiClient } from "./client";

export type Environment = "DEV" | "QA" | "PROD";

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage: number | null;
  environment: Environment;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PaginatedFeatureFlags {
  items: FeatureFlag[];
  pagination: { page: number; limit: number; total: number };
}

export interface CreateFeatureFlagInput {
  name: string;
  key: string;
  description?: string;
  is_enabled?: boolean;
  rollout_percentage?: number;
  environment?: Environment;
}

export interface UpdateFeatureFlagInput {
  name?: string;
  description?: string;
  is_enabled?: boolean;
  rollout_percentage?: number;
  environment?: Environment;
}

export interface FeatureFlagOverride {
  id: string;
  feature_flag_id: string;
  tenant_id: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string | null;
}

export const featureFlagsApi = {
  list(
    params: {
      page?: number;
      limit?: number;
      is_enabled?: boolean;
      environment?: Environment;
      search?: string;
      sort_by?: "created_at" | "name";
      order?: "asc" | "desc";
    } = {},
  ): Promise<PaginatedFeatureFlags> {
    return apiClient.get<PaginatedFeatureFlags>("/api/v1/feature-flags/", {
      query: params as Record<string, unknown>,
      tenantId: null,
    });
  },

  create(input: CreateFeatureFlagInput): Promise<FeatureFlag> {
    return apiClient.post<FeatureFlag>("/api/v1/feature-flags/", input, { tenantId: null });
  },

  update(flagId: string, input: UpdateFeatureFlagInput): Promise<FeatureFlag> {
    return apiClient.put<FeatureFlag>(`/api/v1/feature-flags/${flagId}`, input, { tenantId: null });
  },

  // Upsert a per-tenant override.
  setOverride(flagId: string, input: { tenant_id: string; is_enabled: boolean }): Promise<FeatureFlagOverride> {
    return apiClient.put<FeatureFlagOverride>(`/api/v1/feature-flags/${flagId}/overrides`, input, {
      tenantId: null,
    });
  },

  // Evaluate a flag against an arbitrary context (user / tenant / role).
  evaluate(input: {
    flag_key: string;
    context?: Record<string, unknown>;
  }): Promise<{ flag_key: string; enabled: boolean }> {
    return apiClient.post("/api/v1/feature-flags/evaluate", { context: {}, ...input });
  },
};
