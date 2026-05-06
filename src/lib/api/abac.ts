// ABAC Policies — /api/v1/policies/*. Attribute-based access control engine.
//
// The condition DSL supports operators: eq, neq, in, not_in, gt, gte, lt, lte,
// contains, exists. Keys use dot notation (e.g. "user.role", "resource.tenant_id").

import { apiClient } from "./client";

export type PolicyEffect = "allow" | "deny";

export type ConditionRule =
  | string
  | number
  | boolean
  | { eq?: unknown; neq?: unknown; in?: unknown[]; not_in?: unknown[];
      gt?: number; gte?: number; lt?: number; lte?: number;
      contains?: unknown; exists?: boolean };

export type PolicyConditions = Record<string, ConditionRule>;

export interface ABACPolicy {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions: PolicyConditions;
  effect: PolicyEffect;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePolicyInput {
  name: string;
  description?: string;
  resource: string;
  action: string;
  conditions?: PolicyConditions;
  effect?: PolicyEffect;
}

export interface UpdatePolicyInput {
  description?: string;
  conditions?: PolicyConditions;
  effect?: PolicyEffect;
  is_active?: boolean;
}

export interface EvaluateInput {
  resource: string;
  action: string;
  attributes?: Record<string, unknown>;
}

export interface EvaluateResult {
  allowed: boolean;
  reason: string;
}

export const abacApi = {
  list(params: { resource?: string; is_active?: boolean } = {}): Promise<ABACPolicy[]> {
    return apiClient.get<ABACPolicy[]>("/api/v1/policies", { query: params as Record<string, unknown> });
  },

  get(policyId: string): Promise<ABACPolicy> {
    return apiClient.get<ABACPolicy>(`/api/v1/policies/${policyId}`);
  },

  create(input: CreatePolicyInput): Promise<ABACPolicy> {
    return apiClient.post<ABACPolicy>("/api/v1/policies", input);
  },

  update(policyId: string, input: UpdatePolicyInput): Promise<ABACPolicy> {
    return apiClient.put<ABACPolicy>(`/api/v1/policies/${policyId}`, input);
  },

  remove(policyId: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/policies/${policyId}`);
  },

  // Run policy evaluation against a hypothetical resource/action/attributes.
  // The current user's attributes are always merged in server-side.
  evaluate(input: EvaluateInput): Promise<EvaluateResult> {
    return apiClient.post<EvaluateResult>("/api/v1/policies/evaluate", { attributes: {}, ...input });
  },
};
