// Outbound webhooks — /api/v1/webhooks/*.

import { apiClient } from "./client";

export interface Webhook {
  id: string;
  tenant_id: string | null;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

// `secret` is only present on the registration response — store it client-side
// because the backend will not return it again.
export interface WebhookCreated extends Webhook {
  secret: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: string;
  status: string;
  response: string;
  retry_count: number;
  created_at: string;
}

export const webhooksApi = {
  register(input: {
    url: string;
    events: string[];
    secret?: string;
    is_active?: boolean;
  }): Promise<WebhookCreated> {
    return apiClient.post<WebhookCreated>("/api/v1/webhooks", input);
  },

  // List all webhooks for the current tenant.
  list(): Promise<Webhook[]> {
    return apiClient.get<Webhook[]>("/api/v1/webhooks");
  },

  // Delivery history for a single webhook — useful for debugging signature
  // verification or seeing what the destination returned.
  listDeliveries(
    webhookId: string,
    params: { limit?: number; offset?: number } = {},
  ): Promise<WebhookDelivery[]> {
    return apiClient.get<WebhookDelivery[]>(`/api/v1/webhooks/${webhookId}/deliveries`, {
      query: params as Record<string, unknown>,
    });
  },
};
