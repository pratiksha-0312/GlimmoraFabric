// Refunds API — /api/v1/refunds/*.

import { apiClient } from "./client";

export interface Refund {
  id: string;
  tenant_id: string;
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  provider_refund_id: string | null;
  reason: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface InitiateRefundInput {
  payment_id: string;
  // Omit `amount` for a full refund.
  amount?: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export const refundsApi = {
  initiate(input: InitiateRefundInput): Promise<Refund> {
    return apiClient.post<Refund>("/api/v1/refunds", input);
  },

  list(params: { status?: string; limit?: number; offset?: number } = {}): Promise<Refund[]> {
    return apiClient.get<Refund[]>("/api/v1/refunds", { query: params });
  },

  get(refundId: string): Promise<Refund> {
    return apiClient.get<Refund>(`/api/v1/refunds/${refundId}`);
  },
};
