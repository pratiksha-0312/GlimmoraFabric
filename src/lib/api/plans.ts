// Plans API — /api/v1/plans/*. Cross-tenant catalog managed by Super Admin.
// We pass `tenantId: null` so the client doesn't auto-attach the X-Tenant-ID
// header (these endpoints are tenant-agnostic).

import { apiClient } from "./client";

export type BillingCycle = "monthly" | "yearly" | "MONTHLY" | "YEARLY";

export interface Plan {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  currency: string;
  billing_cycle: BillingCycle;
  features: Record<string, unknown>;
  max_users: number | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PaginatedPlans {
  items: Plan[];
  pagination: { page: number; limit: number; total: number };
}

export interface CreatePlanInput {
  name: string;
  code: string;
  description?: string;
  price: number;
  currency?: string;
  billing_cycle?: BillingCycle;
  features?: Record<string, unknown>;
  max_users?: number;
  is_active?: boolean;
}

export interface UpdatePlanInput {
  name?: string;
  code?: string;
  description?: string;
  price?: number;
  currency?: string;
  billing_cycle?: BillingCycle;
  features?: Record<string, unknown>;
  max_users?: number;
  is_active?: boolean;
}

export interface ListPlansParams {
  page?: number;
  limit?: number;
  is_active?: boolean;
  billing_cycle?: "MONTHLY" | "YEARLY";
  sort_by?: "created_at" | "price" | "name";
  order?: "asc" | "desc";
}

// ---- Feature matrix --------------------------------------------------------

export interface PlanFeature {
  id: string;
  feature_key: string;
  feature_name: string;
  is_enabled: boolean;
  limit_value: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface PlanFeatureItem {
  feature_key: string;
  feature_name?: string;
  is_enabled?: boolean;
  limit_value?: number | null;
}

export const plansApi = {
  list(params: ListPlansParams = {}): Promise<PaginatedPlans> {
    return apiClient.get<PaginatedPlans>("/api/v1/plans/", {
      query: params as Record<string, unknown>,
      tenantId: null,
    });
  },

  create(input: CreatePlanInput): Promise<Plan> {
    return apiClient.post<Plan>("/api/v1/plans/", input, { tenantId: null });
  },

  update(planId: string, input: UpdatePlanInput): Promise<Plan> {
    return apiClient.put<Plan>(`/api/v1/plans/${planId}`, input, { tenantId: null });
  },

  remove(planId: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/plans/${planId}`, { tenantId: null });
  },

  // ---- Plan feature matrix -------------------------------------------------

  listFeatures(planId: string): Promise<PlanFeature[]> {
    return apiClient.get<PlanFeature[]>(`/api/v1/plans/${planId}/features`, { tenantId: null });
  },

  upsertFeatures(planId: string, features: PlanFeatureItem[]): Promise<PlanFeature[]> {
    return apiClient.put<PlanFeature[]>(
      `/api/v1/plans/${planId}/features`,
      { features },
      { tenantId: null },
    );
  },
};
