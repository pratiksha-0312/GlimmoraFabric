// Notifications hub — /api/v1/notifications/*.
//
// Covers the main dispatch hub and the in-app feed. Channel-specific
// endpoints (SMS, push, email, WhatsApp) live in `notification-channels.ts`.
// All endpoints in this file expect an X-Tenant-ID header, which the
// client auto-injects from `tenantStorage`.

import { apiClient } from "./client";

// ---- Generic dispatch -------------------------------------------------------

export interface SendNotificationInput {
  channel: "email" | "sms" | "webhook";
  template_id: string;
  recipient: string;
  variables?: Record<string, unknown>;
  webhook_url?: string;
}

export interface NotificationLog {
  id: string;
  channel: string;
  recipient: string;
  status: string;
  attempts: number;
  created_at: string;
}

// ---- In-app feed ------------------------------------------------------------

export interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  payload: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export interface PaginatedInAppNotifications {
  items: InAppNotification[];
  total: number;
  limit: number;
  offset: number;
}

// ---- Preferences ------------------------------------------------------------

export interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  whatsapp_enabled: boolean;
  in_app_enabled: boolean;
  unsubscribe_token?: string | null;
}

export type NotificationPreferencesUpdate = Partial<Omit<NotificationPreferences, "unsubscribe_token">>;

// ---- Module -----------------------------------------------------------------

export const notificationsApi = {
  // Send via the multi-channel hub
  send(input: SendNotificationInput): Promise<NotificationLog> {
    return apiClient.post<NotificationLog>("/api/v1/notifications/send", input);
  },

  list(params: { status?: string; limit?: number; offset?: number } = {}): Promise<NotificationLog[]> {
    return apiClient.get<NotificationLog[]>("/api/v1/notifications/", { query: params });
  },

  get(notificationId: string): Promise<NotificationLog> {
    return apiClient.get<NotificationLog>(`/api/v1/notifications/${notificationId}`);
  },

  // ---- In-app feed ----------------------------------------------------------

  inApp: {
    list(params: { limit?: number; offset?: number; unread_only?: boolean } = {}): Promise<PaginatedInAppNotifications> {
      return apiClient.get<PaginatedInAppNotifications>("/api/v1/notifications", { query: params });
    },

    unreadCount(): Promise<{ count: number }> {
      return apiClient.get("/api/v1/notifications/unread-count");
    },

    create(input: {
      user_id: string;
      title: string;
      body: string;
      payload?: Record<string, unknown>;
    }): Promise<InAppNotification> {
      return apiClient.post<InAppNotification>("/api/v1/notifications/in-app", input);
    },

    markRead(notificationId: string): Promise<void> {
      return apiClient.put<void>(`/api/v1/notifications/${notificationId}/read`);
    },
  },

  // ---- Preferences ----------------------------------------------------------

  preferences: {
    get(): Promise<NotificationPreferences> {
      return apiClient.get<NotificationPreferences>("/api/v1/notifications/preferences");
    },

    update(input: NotificationPreferencesUpdate): Promise<NotificationPreferences> {
      return apiClient.put<NotificationPreferences>("/api/v1/notifications/preferences", input);
    },

    // Public — no auth required.
    unsubscribe(token: string): Promise<NotificationPreferences> {
      return apiClient.get<NotificationPreferences>(
        `/api/v1/notifications/unsubscribe/${encodeURIComponent(token)}`,
        { skipAuth: true, tenantId: null },
      );
    },
  },
};
