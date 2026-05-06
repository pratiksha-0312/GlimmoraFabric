// Entitlements API — /api/v1/entitlements/*.
// Resolves whether a tenant has access to a feature, with usage counters
// and remaining quota.

import { apiClient } from "./client";

export interface Entitlement {
  tenant_id: string;
  feature_code: string;
  is_entitled: boolean;
  is_enabled: boolean;
  usage_limit: number | null;
  usage_consumed: number;
  remaining: number | null;
  valid_from: string | null;
  valid_to: string | null;
  plan_name: string;
}

export const entitlementsApi = {
  check(tenantId: string, featureCode: string): Promise<Entitlement> {
    return apiClient.get<Entitlement>(`/api/v1/entitlements/${tenantId}/${featureCode}`);
  },
};
