// Knowledge Base — /api/v1/ai/knowledge/*. RAG document store.

import { apiClient } from "./client";

export interface KnowledgeDocument {
  id: string;
  title: string;
  name: string;
  content: string | null;
  source: string | null;
  file_url: string;
  file_type: string;
  file_size: number;
  status: string;
  chunk_count: number;
  error_message: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  created_by: string;
  created_at: string;
  updated_at: string | null;
}

export interface KnowledgeDocumentListItem {
  id: string;
  title: string;
  name: string;
  source: string | null;
  file_type: string;
  file_size: number;
  status: string;
  chunk_count: number;
  created_at: string;
}

export interface PaginatedKnowledgeDocuments {
  items: KnowledgeDocumentListItem[];
  pagination: { page: number; page_size: number; total: number };
}

export const knowledgeApi = {
  // Upload PDF / DOCX / TXT for chunking, embedding, and indexing.
  upload(file: File): Promise<KnowledgeDocument> {
    const fd = new FormData();
    fd.append("file", file);
    return apiClient.post<KnowledgeDocument>("/api/v1/ai/knowledge", fd);
  },

  list(
    params: { page?: number; page_size?: number; search?: string; status?: string } = {},
  ): Promise<PaginatedKnowledgeDocuments> {
    return apiClient.get<PaginatedKnowledgeDocuments>("/api/v1/ai/knowledge", { query: params });
  },

  get(documentId: string): Promise<KnowledgeDocument> {
    return apiClient.get<KnowledgeDocument>(`/api/v1/ai/knowledge/${documentId}`);
  },

  remove(documentId: string): Promise<{ id: string }> {
    return apiClient.delete(`/api/v1/ai/knowledge/${documentId}`);
  },
};
