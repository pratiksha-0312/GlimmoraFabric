// AI Prompts — /api/v1/ai/prompts/*. Versioned prompt registry + execution + scoring.

import { apiClient } from "./client";

export interface Prompt {
  id: string;
  name: string;
  description: string;
  template_content: string;
  variables: string[];
  tags: string[];
  is_active: boolean;
  version: number;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PromptListItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
}

export interface PaginatedPrompts {
  items: PromptListItem[];
  pagination: { page: number; page_size: number; total: number };
}

export interface PromptSummary {
  id: string;
  name: string;
  version: number;
}

export interface PromptUpdateSummary {
  id: string;
  name: string;
  is_active: boolean;
  updated_at: string | null;
}

export interface PromptVersion {
  id: string;
  version_number: number;
  content: string;
  created_by: string | null;
  created_at: string;
}

export interface CreatePromptInput {
  name: string;
  description?: string;
  template_content: string;
  variables?: string[];
  tags?: string[];
  is_active?: boolean;
}

export interface UpdatePromptInput {
  name?: string;
  description?: string;
  template_content?: string;
  variables?: string[];
  tags?: string[];
  is_active?: boolean;
}

// ---- Execution --------------------------------------------------------------

export interface PromptExecution {
  id: string;
  prompt_id: string;
  version_id: string | null;
  input_payload: Record<string, unknown>;
  output_response: string | null;
  execution_status: string;
  error_message: string | null;
  execution_time_ms: number | null;
  retry_count: number;
  executed_by: string | null;
  created_at: string;
}

// ---- Evaluation -------------------------------------------------------------

export interface PromptEvaluation {
  id: string;
  prompt_id: string;
  evaluator_id: string;
  relevance_score: number;
  accuracy_score: number;
  creativity_score: number;
  overall_score: number;
  feedback: string;
  created_at: string;
}

export interface CreateEvaluationInput {
  // Each score is 0–10.
  relevance_score: number;
  accuracy_score: number;
  creativity_score: number;
  // Auto-calculated server-side if omitted.
  overall_score?: number;
  feedback?: string;
}

// ---- Module -----------------------------------------------------------------

export const promptsApi = {
  list(
    params: {
      search?: string;
      tags?: string;
      is_active?: boolean;
      page?: number;
      page_size?: number;
    } = {},
  ): Promise<PaginatedPrompts> {
    return apiClient.get<PaginatedPrompts>("/api/v1/ai/prompts/", { query: params as Record<string, unknown> });
  },

  create(input: CreatePromptInput): Promise<PromptSummary> {
    return apiClient.post<PromptSummary>("/api/v1/ai/prompts/", input);
  },

  update(promptId: string, input: UpdatePromptInput): Promise<PromptUpdateSummary> {
    return apiClient.put<PromptUpdateSummary>(`/api/v1/ai/prompts/${promptId}`, input);
  },

  listVersions(promptId: string): Promise<PromptVersion[]> {
    return apiClient.get<PromptVersion[]>(`/api/v1/ai/prompts/${promptId}/versions`);
  },

  // Run the prompt with variable substitutions. Returns the execution record
  // including the rendered output and timing.
  run(promptId: string, variables: Record<string, string> = {}): Promise<PromptExecution> {
    return apiClient.post<PromptExecution>(`/api/v1/ai/prompts/${promptId}/run`, { variables });
  },

  // Submit a quality evaluation. Useful for human-in-the-loop grading.
  evaluate(promptId: string, input: CreateEvaluationInput): Promise<PromptEvaluation> {
    return apiClient.post<PromptEvaluation>(`/api/v1/ai/prompts/${promptId}/evaluate`, input);
  },
};
