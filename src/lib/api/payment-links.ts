// Payment Links — /api/v1/payment-links/* (authenticated) and /pay/{link_id}
// (public checkout — no auth, no tenant header).

import { apiClient } from "./client";
import type { PaymentProvider } from "./payments";

export interface PaymentLink {
  id: string;
  tenant_id: string;
  created_by: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  expires_at: string | null;
  payment_id: string | null;
  created_at: string;
  link: string;
}

export interface CreatePaymentLinkInput {
  amount: number;
  currency?: string;
  description?: string;
  expires_at?: string;
  metadata?: Record<string, unknown>;
}

export interface CheckoutDetails {
  link_id: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  expires_at: string | null;
}

export const paymentLinksApi = {
  create(input: CreatePaymentLinkInput): Promise<PaymentLink> {
    return apiClient.post<PaymentLink>("/api/v1/payment-links", input);
  },

  list(params: { status?: string; limit?: number; offset?: number } = {}): Promise<PaymentLink[]> {
    return apiClient.get<PaymentLink[]>("/api/v1/payment-links", { query: params });
  },

  get(linkId: string): Promise<PaymentLink> {
    return apiClient.get<PaymentLink>(`/api/v1/payment-links/${linkId}`);
  },
};

// ---- Public checkout flow --------------------------------------------------
// These endpoints are unauthenticated and tenant-less (called from the public
// /pay/{link_id} page that embeds a checkout widget).

export const checkoutApi = {
  // Fetch the public-facing details of a payment link.
  getDetails(linkId: string): Promise<CheckoutDetails> {
    return apiClient.get<CheckoutDetails>(`/pay/${linkId}`, {
      skipAuth: true,
      tenantId: null,
    });
  },

  // Initiate payment from the checkout link. Returns provider order details
  // (e.g., Razorpay order_id / Stripe client_secret) for the SDK.
  pay(linkId: string, provider: PaymentProvider = "razorpay"): Promise<Record<string, unknown>> {
    return apiClient.post<Record<string, unknown>>(`/pay/${linkId}`, { provider }, {
      skipAuth: true,
      tenantId: null,
    });
  },
};
