// Subscriptions API — /api/v1/subscriptions/*. Tenant-scoped: the client
// auto-injects X-Tenant-ID from `tenantStorage`.

import { apiClient } from "./client";
import type { Plan } from "./plans";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "paused"
  | "cancelled"
  | "expired"
  | "past_due";

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: SubscriptionStatus | string;
  billing_cycle: string;
  auto_renew: boolean;
  start_date: string;
  end_date: string | null;
  trial_ends_at: string | null;
  payment_id: string | null;
  created_at: string;
  updated_at: string | null;
  plan?: Plan | null;
}

export interface CreateSubscriptionInput {
  plan_id: string;
  billing_cycle?: "monthly" | "yearly";
}

export interface UpdateSubscriptionInput {
  // Sending a different plan_id triggers a plan change (and may emit a
  // proration record — preview first via `previewProration`).
  plan_id?: string;
  billing_cycle?: "monthly" | "yearly";
  auto_renew?: boolean;
}

export interface ProrationPreview {
  old_plan: string;
  new_plan: string;
  old_price: number;
  new_price: number;
  days_remaining: number;
  cycle_days: number;
  prorated_amount: number;
  currency: string;
}

export interface DunningRecord {
  id: string;
  tenant_id: string;
  subscription_id: string;
  payment_id: string | null;
  attempt_number: number;
  max_attempts: number;
  status: string;
  last_failure_reason: string | null;
  next_retry_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

export const subscriptionsApi = {
  // The current tenant's active subscription (resolved server-side from
  // X-Tenant-ID). Use this on dashboards/headers to avoid plumbing IDs.
  current(): Promise<Subscription | null> {
    return apiClient.get<Subscription | null>("/api/v1/subscriptions/current");
  },

  create(input: CreateSubscriptionInput): Promise<Subscription> {
    return apiClient.post<Subscription>("/api/v1/subscriptions", input);
  },

  get(subscriptionId: string): Promise<Subscription> {
    return apiClient.get<Subscription>(`/api/v1/subscriptions/${subscriptionId}`);
  },

  update(subscriptionId: string, input: UpdateSubscriptionInput): Promise<Subscription> {
    return apiClient.put<Subscription>(`/api/v1/subscriptions/${subscriptionId}`, input);
  },

  // ---- Lifecycle -----------------------------------------------------------

  cancel(subscriptionId: string): Promise<Subscription> {
    return apiClient.post<Subscription>(`/api/v1/subscriptions/${subscriptionId}/cancel`);
  },

  pause(subscriptionId: string): Promise<Subscription> {
    return apiClient.post<Subscription>(`/api/v1/subscriptions/${subscriptionId}/pause`);
  },

  resume(subscriptionId: string): Promise<Subscription> {
    return apiClient.post<Subscription>(`/api/v1/subscriptions/${subscriptionId}/resume`);
  },

  // Start (or extend) a trial. Default 14 days, max 90.
  startTrial(subscriptionId: string, trialDays = 14): Promise<Subscription> {
    return apiClient.post<Subscription>(
      `/api/v1/subscriptions/${subscriptionId}/trial`,
      { trial_days: trialDays },
    );
  },

  // ---- Plan change tooling -------------------------------------------------

  // Show the prorated charge that an upgrade/downgrade would produce, without
  // committing the change. Pass `?new_plan_id=` as a query param.
  previewProration(subscriptionId: string, newPlanId: string): Promise<ProrationPreview> {
    return apiClient.get<ProrationPreview>(`/api/v1/subscriptions/${subscriptionId}/proration`, {
      query: { new_plan_id: newPlanId },
    });
  },

  // ---- Dunning -------------------------------------------------------------

  listDunning(subscriptionId: string): Promise<DunningRecord[]> {
    return apiClient.get<DunningRecord[]>(`/api/v1/subscriptions/${subscriptionId}/dunning`);
  },

  // ---- Feature gating ------------------------------------------------------
  // Quick check: does the given tenant's active plan grant a feature?
  // Prefer `entitlementsApi.check` for limit/usage detail.
  hasFeature(tenantId: string, featureName: string): Promise<{ feature: string; has_access: boolean }> {
    return apiClient.get(`/api/v1/subscriptions/${tenantId}/features/${featureName}`);
  },
};
