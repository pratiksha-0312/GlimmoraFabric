// Semantic search / RAG query — /api/v1/ai/search.

import { apiClient } from "./client";

export interface SearchResult {
  id: string;
  document_id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface SemanticSearchResponse {
  query: string;
  top_k: number;
  total_results: number;
  results: SearchResult[];
}

export const searchApi = {
  query(input: { query: string; top_k?: number }): Promise<SemanticSearchResponse> {
    return apiClient.post<SemanticSearchResponse>("/api/v1/ai/search", { top_k: 5, ...input });
  },
};
