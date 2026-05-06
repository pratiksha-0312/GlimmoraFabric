// AI analytics — /api/v1/ai/analytics/*. Token usage, cost, and quality metrics.

import { apiClient } from "./client";

export type GroupByPeriod = "day" | "week" | "month";

// ---- Common shapes ----------------------------------------------------------

export interface UsageSummary {
  total_requests: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  total_cost: number;
  avg_tokens_per_request: number;
  avg_cost_per_request: number;
}

export interface UsageByPeriod {
  period: string;
  total_requests: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost: number;
}

export interface UsageByModel {
  model_name: string;
  total_requests: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost: number;
}

export interface UsageBreakdown {
  by_period: UsageByPeriod[];
  by_model: UsageByModel[];
}

export interface UsageLogItem {
  id: string;
  user_id: string | null;
  tenant_id: string | null;
  model_name: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost: number;
  operation_type: string;
  execution_time_ms: number | null;
  created_at: string;
}

export interface AIUsageAnalytics {
  filters_applied: Record<string, unknown>;
  summary: UsageSummary;
  breakdown: UsageBreakdown;
  detailed_logs: UsageLogItem[] | null;
  detail_pagination: { page: number; page_size: number; total: number } | null;
}

// ---- Dashboard --------------------------------------------------------------

export interface DashboardModelUsageItem {
  model_name: string;
  tokens_used: number;
  request_count: number;
  cost: number;
  avg_latency: number;
}

export interface AIDashboard {
  total_tokens: number;
  total_requests: number;
  avg_latency: number;
  success_rate: number;
  total_cost: number;
  model_usage: DashboardModelUsageItem[];
  model_usage_pagination: { limit: number; offset: number; total: number };
  filters_applied: Record<string, unknown>;
}

// ---- Tenant cost ------------------------------------------------------------

export interface TenantCostItem {
  tenant_id: string;
  total_cost: number;
  total_tokens_used: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  request_count: number;
  first_usage_at: string | null;
  last_usage_at: string | null;
}

export interface TenantCostAnalytics {
  filters_applied: Record<string, unknown>;
  data: TenantCostItem[];
  pagination: { limit: number; offset: number; total: number };
}

// ---- Performance metrics ----------------------------------------------------

export interface PerformanceMetricItem {
  id: string;
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  latency_ms: number;
  evaluation_dataset: string | null;
  notes: string | null;
  created_at: string;
}

export interface AggregatedModelMetrics {
  model_name: string;
  evaluation_count: number;
  avg_accuracy: number;
  avg_precision: number;
  avg_recall: number;
  avg_f1_score: number;
  avg_latency_ms: number;
  min_latency_ms: number;
  max_latency_ms: number;
}

export interface PerformanceMetrics {
  filters_applied: Record<string, unknown>;
  aggregated: AggregatedModelMetrics[];
  items: PerformanceMetricItem[];
  pagination: { limit: number; offset: number; total: number };
}

// ---- Module -----------------------------------------------------------------

export const aiAnalyticsApi = {
  // Unified dashboard — totals + per-model breakdown for a date window.
  dashboard(
    params: {
      start_date?: string;
      end_date?: string;
      tenant_id?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<AIDashboard> {
    return apiClient.get<AIDashboard>("/api/v1/ai/analytics", {
      query: params as Record<string, unknown>,
      tenantId: null,
    });
  },

  usage(
    params: {
      start_date?: string;
      end_date?: string;
      tenant_id?: string;
      user_id?: string;
      model_name?: string;
      group_by?: GroupByPeriod;
      detailed?: boolean;
      page?: number;
      page_size?: number;
    } = {},
  ): Promise<AIUsageAnalytics> {
    return apiClient.get<AIUsageAnalytics>("/api/v1/ai/analytics/usage", {
      query: params as Record<string, unknown>,
      tenantId: null,
    });
  },

  costByTenant(
    params: {
      start_date?: string;
      end_date?: string;
      tenant_id?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<TenantCostAnalytics> {
    return apiClient.get<TenantCostAnalytics>("/api/v1/ai/analytics/cost", {
      query: params as Record<string, unknown>,
      tenantId: null,
    });
  },

  performance(
    params: {
      model_name?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<PerformanceMetrics> {
    return apiClient.get<PerformanceMetrics>("/api/v1/ai/analytics/performance", {
      query: params as Record<string, unknown>,
      tenantId: null,
    });
  },
};
