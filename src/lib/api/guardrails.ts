// AI guardrail rules — /api/v1/ai/guardrails.

import { apiClient } from "./client";

export type GuardrailRuleType = "toxicity" | "pii" | "hallucination" | "safety";

export interface GuardrailRule {
  id: string;
  name: string;
  description: string;
  rule_type: GuardrailRuleType | string;
  config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface GuardrailRuleList {
  items: GuardrailRule[];
  total: number;
}

export interface UpdateGuardrailRuleItem {
  id: string;
  name?: string;
  description?: string;
  rule_type?: GuardrailRuleType;
  config?: Record<string, unknown>;
  is_active?: boolean;
}

export const guardrailsApi = {
  list(): Promise<GuardrailRuleList> {
    return apiClient.get<GuardrailRuleList>("/api/v1/ai/guardrails");
  },

  // Bulk update — each item must include the rule `id`. Only non-null
  // fields are applied (partial update). Up to 50 rules per call.
  bulkUpdate(rules: UpdateGuardrailRuleItem[]): Promise<GuardrailRuleList> {
    return apiClient.put<GuardrailRuleList>("/api/v1/ai/guardrails", { rules });
  },
};
