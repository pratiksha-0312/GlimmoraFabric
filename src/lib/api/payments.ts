// Payments API — /api/v1/payments/*. All endpoints expect X-Tenant-ID,
// which the client auto-injects from `tenantStorage`.

import { apiClient } from "./client";

export type PaymentProvider = "razorpay" | "stripe";

export interface Payment {
  id: string;
  tenant_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreatePaymentInput {
  amount: number;
  currency?: string;
  provider?: PaymentProvider;
  metadata?: Record<string, unknown>;
}

export interface ConfirmPaymentInput {
  provider_payment_id: string;
  provider_signature: string;
}

export const paymentsApi = {
  create(input: CreatePaymentInput): Promise<Payment> {
    return apiClient.post<Payment>("/api/v1/payments", input);
  },

  list(params: { status?: string; limit?: number; offset?: number } = {}): Promise<Payment[]> {
    return apiClient.get<Payment[]>("/api/v1/payments", { query: params });
  },

  get(paymentId: string): Promise<Payment> {
    return apiClient.get<Payment>(`/api/v1/payments/${paymentId}`);
  },

  // After the gateway returns a payment_id + signature, send them here for
  // server-side verification & marking the payment captured.
  confirm(paymentId: string, input: ConfirmPaymentInput): Promise<Payment> {
    return apiClient.post<Payment>(`/api/v1/payments/${paymentId}/confirm`, input);
  },

  // 3DS challenge (stub on the backend — kept for future flows).
  threeDS(paymentId: string, callbackUrl = ""): Promise<{ challenge_url?: string }> {
    return apiClient.post(`/api/v1/payments/${paymentId}/3ds`, { callback_url: callbackUrl });
  },
};
