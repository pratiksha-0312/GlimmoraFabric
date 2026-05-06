// Managed notification templates — /api/v1/notification-templates/*.
// Versioned Jinja2 templates with preview support.

import { apiClient } from "./client";

export interface NotificationTemplate {
  id: string;
  slug: string;
  description: string;
  latest_version: number;
  created_at: string;
}

export interface TemplateVersion {
  id: string;
  version: number;
  subject: string;
  body: string;
  created_at: string;
}

export interface TemplatePreview {
  subject_rendered: string;
  body_rendered: string;
  version: number;
}

export const notificationTemplatesApi = {
  upsert(input: {
    id?: string;
    slug: string;
    description?: string;
    subject?: string;
    body: string;
  }): Promise<NotificationTemplate> {
    return apiClient.put<NotificationTemplate>("/api/v1/notification-templates/", input);
  },

  remove(id: string): Promise<void> {
    return apiClient.delete<void>("/api/v1/notification-templates/", { body: { id } });
  },

  listVersions(templateId: string): Promise<TemplateVersion[]> {
    return apiClient.get<TemplateVersion[]>(
      `/api/v1/notification-templates/${templateId}/versions`,
    );
  },

  preview(
    templateId: string,
    input: { variables?: Record<string, string>; version?: number } = {},
  ): Promise<TemplatePreview> {
    return apiClient.post<TemplatePreview>(
      `/api/v1/notification-templates/${templateId}/preview`,
      input,
    );
  },
};
