// Payment Gateways — /api/v1/payment-gateways/*.
// Tenant-scoped configuration of provider credentials, health, routing
// rules, and aggregated billing analytics.

import { apiClient } from "./client";

export type GatewayName = "razorpay" | "stripe" | "adyen" | "checkout" | "paytabs";

export interface Gateway {
  id: string;
  name: string;
  display_name: string;
  status: string;
  health_status: string;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string | null;
  has_credentials: boolean;
}

export interface GatewayHealth {
  name: string;
  status: string;
  health_status: string;
  last_checked_at: string | null;
}

export interface ConfigureGatewayInput {
  name: GatewayName;
  display_name?: string;
  credentials: Record<string, unknown>;
  status?: "active" | "inactive";
}

export interface UpdateGatewayInput {
  display_name?: string;
  credentials?: Record<string, unknown>;
  status?: "active" | "inactive";
}

export interface RoutingRule {
  id: string;
  gateway_name: string;
  country: string | null;
  currency: string | null;
  min_amount: number | null;
  max_amount: number | null;
  priority: number;
  cost_score: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateRoutingRuleInput {
  gateway_name: GatewayName;
  country?: string;
  currency?: string;
  min_amount?: number;
  max_amount?: number;
  priority?: number;
  cost_score?: number;
  is_active?: boolean;
}

export interface BillingAnalytics {
  total_payments: number;
  total_revenue: number;
  currency: string;
  successful_payments: number;
  failed_payments: number;
  active_subscriptions: number;
  active_dunning: number;
  gateways: GatewayHealth[];
  revenue_by_gateway: Record<string, number>;
}

export const paymentGatewaysApi = {
  configure(input: ConfigureGatewayInput): Promise<Gateway> {
    return apiClient.post<Gateway>("/api/v1/payment-gateways", input);
  },

  list(): Promise<Gateway[]> {
    return apiClient.get<Gateway[]>("/api/v1/payment-gateways");
  },

  update(gatewayId: string, input: UpdateGatewayInput): Promise<Gateway> {
    return apiClient.put<Gateway>(`/api/v1/payment-gateways/${gatewayId}`, input);
  },

  // Trigger a synchronous health check against the provider's live API.
  healthCheck(gatewayId: string): Promise<GatewayHealth> {
    return apiClient.post<GatewayHealth>(`/api/v1/payment-gateways/${gatewayId}/health-check`);
  },

  // Aggregated health across every configured gateway for this tenant.
  health(): Promise<GatewayHealth[]> {
    return apiClient.get<GatewayHealth[]>("/api/v1/payment-gateways/health");
  },

  analytics(): Promise<BillingAnalytics> {
    return apiClient.get<BillingAnalytics>("/api/v1/payment-gateways/analytics");
  },

  // ---- Routing rules -------------------------------------------------------

  listRoutingRules(): Promise<RoutingRule[]> {
    return apiClient.get<RoutingRule[]>("/api/v1/payment-gateways/routing-rules");
  },

  createRoutingRule(input: CreateRoutingRuleInput): Promise<RoutingRule> {
    return apiClient.post<RoutingRule>("/api/v1/payment-gateways/routing-rules", input);
  },

  deleteRoutingRule(ruleId: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/payment-gateways/routing-rules/${ruleId}`);
  },
};
