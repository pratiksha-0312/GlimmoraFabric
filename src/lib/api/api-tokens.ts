// Extended API Tokens — /api/v1/tokens/*. Scope management and usage analytics.
//
// Basic CRUD (create / list / revoke) lives on `authApi.api-tokens` because
// the backend hosts those under `/api/v1/auth/api-tokens`. This module
// covers the analytics + scope endpoints under the `/api/v1/tokens` prefix.

import { apiClient } from "./client";

export interface TokenUsageLog {
  id: string;
  token_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  ip_address: string;
  created_at: string;
}

export interface TokenUsageEnvelope {
  logs: TokenUsageLog[];
  total: number;
  limit: number;
  offset: number;
}

export interface TokenUsageSummary {
  token_id: string;
  token_name: string;
  period_days: number;
  total_requests: number;
  status_breakdown: Record<string, number>;
  top_endpoints: { endpoint: string; count: number }[];
  unique_ips: number;
  last_used_at: string | null;
}

export const apiTokensApi = {
  updateScopes(tokenId: string, scopes: string): Promise<{ token_id: string; scopes: string }> {
    return apiClient.put(`/api/v1/tokens/${tokenId}/scopes`, { scopes });
  },

  // Recent usage logs for the token. `days` defaults to 30 (1–365).
  getUsage(
    tokenId: string,
    params: { days?: number; limit?: number; offset?: number } = {},
  ): Promise<TokenUsageEnvelope> {
    return apiClient.get<TokenUsageEnvelope>(`/api/v1/tokens/${tokenId}/usage`, {
      query: params as Record<string, unknown>,
    });
  },

  // Aggregated stats — status code breakdown, top endpoints, unique IPs.
  getUsageSummary(tokenId: string, days = 30): Promise<TokenUsageSummary> {
    return apiClient.get<TokenUsageSummary>(`/api/v1/tokens/${tokenId}/usage/summary`, {
      query: { days },
    });
  },
};
