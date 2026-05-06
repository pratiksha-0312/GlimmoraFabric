// Channel-specific notification APIs:
//   - SMS:      /api/v1/notifications/sms/*
//   - Push:     /api/v1/notifications/push/*
//   - Email:    /api/v1/notifications/email/*
//   - WhatsApp: /api/v1/notifications/whatsapp/*
//
// All endpoints expect X-Tenant-ID; the client auto-injects it.

import { apiClient } from "./client";

// ---- SMS --------------------------------------------------------------------

export interface SmsSendResult {
  log_id: string;
  status: string;
  external_id?: string | null;
}

export interface SmsOtpResult {
  log_id: string;
  status: string;
  expires_in_seconds: number;
}

export const smsApi = {
  send(input: { to: string; body: string }): Promise<SmsSendResult> {
    return apiClient.post<SmsSendResult>("/api/v1/notifications/sms/send", input);
  },

  sendOtp(input: { to: string; message_template?: string }): Promise<SmsOtpResult> {
    return apiClient.post<SmsOtpResult>("/api/v1/notifications/sms/otp", input);
  },
};

// ---- Push -------------------------------------------------------------------

export interface PushDevice {
  id: string;
  platform: string;
  created_at: string;
}

export interface PushSendResult {
  targets: number;
  successes: number;
  failures: number;
}

export const pushApi = {
  register(input: { token: string; platform?: "ios" | "android" | "web" | "unknown" }): Promise<PushDevice> {
    return apiClient.post<PushDevice>("/api/v1/notifications/push/register", input);
  },

  send(input: {
    target_user_id?: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }): Promise<PushSendResult> {
    return apiClient.post<PushSendResult>("/api/v1/notifications/push/send", input);
  },

  unregister(token: string): Promise<void> {
    return apiClient.delete<void>("/api/v1/notifications/push/unregister", { query: { token } });
  },
};

// ---- Email (direct-template queue) -----------------------------------------

export interface DirectEmailInput {
  to: string;
  subject: string;
  template: string;
  variables?: Record<string, string>;
}

export interface BatchEmailInput {
  to: string[];
  subject: string;
  template: string;
  variables?: Record<string, string>;
}

export interface EmailQueueStats {
  queue_size: number;
}

export const emailApi = {
  send(input: DirectEmailInput): Promise<{ status: string; message?: string; [k: string]: unknown }> {
    return apiClient.post("/api/v1/notifications/email/send", input);
  },

  sendBatch(input: BatchEmailInput): Promise<{ accepted: number; [k: string]: unknown }> {
    return apiClient.post("/api/v1/notifications/email/batch", input);
  },

  render(input: { template: string; variables?: Record<string, string> }): Promise<{ rendered: string }> {
    return apiClient.post("/api/v1/notifications/email/render", input);
  },

  queueStats(): Promise<EmailQueueStats> {
    return apiClient.get<EmailQueueStats>("/api/v1/notifications/email/queue");
  },
};

// ---- WhatsApp ---------------------------------------------------------------

export interface WhatsAppTemplate {
  id: string;
  name: string;
  language: string;
  body: string;
  created_at: string;
}

export interface WhatsAppSendResult {
  status: string;
  external_id?: string | null;
}

export const whatsappApi = {
  send(input: {
    to: string;
    body?: string;
    template_name?: string;
    template_variables?: Record<string, string>;
  }): Promise<WhatsAppSendResult> {
    return apiClient.post<WhatsAppSendResult>("/api/v1/notifications/whatsapp/send", input);
  },

  listTemplates(): Promise<WhatsAppTemplate[]> {
    return apiClient.get<WhatsAppTemplate[]>("/api/v1/notifications/whatsapp/templates");
  },

  createTemplate(input: { name: string; language?: string; body: string }): Promise<WhatsAppTemplate> {
    return apiClient.post<WhatsAppTemplate>("/api/v1/notifications/whatsapp/templates", input);
  },
};
