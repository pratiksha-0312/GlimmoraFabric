// Document Templates — /api/v1/doc-templates/*.

import { apiClient } from "./client";

export interface DocTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  template_type: string;
  content: string;
  version: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string | null;
}

export interface DocTemplateVersion {
  id: string;
  template_id: string;
  version_number: number;
  content: string;
  change_log: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface CreateDocTemplateInput {
  name: string;
  description?: string;
  template_type: string;
  content: string;
  is_active?: boolean;
}

export interface UpdateDocTemplateInput {
  name?: string;
  description?: string;
  template_type?: string;
  content?: string;
  is_active?: boolean;
  change_log?: string;
}

export interface PaginatedDocTemplateVersions {
  items: DocTemplateVersion[];
  pagination: { page: number; limit: number; total: number };
}

export const docTemplatesApi = {
  create(input: CreateDocTemplateInput): Promise<DocTemplate> {
    return apiClient.post<DocTemplate>("/api/v1/doc-templates", input);
  },

  update(templateId: string, input: UpdateDocTemplateInput): Promise<DocTemplate> {
    return apiClient.put<DocTemplate>(`/api/v1/doc-templates/${templateId}`, input);
  },

  listVersions(templateId: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedDocTemplateVersions> {
    return apiClient.get<PaginatedDocTemplateVersions>(`/api/v1/doc-templates/${templateId}/versions`, { query: params });
  },

  preview(templateId: string, data: Record<string, unknown> = {}): Promise<{ preview: string }> {
    return apiClient.post<{ preview: string }>(`/api/v1/doc-templates/${templateId}/preview`, { data });
  },
};
