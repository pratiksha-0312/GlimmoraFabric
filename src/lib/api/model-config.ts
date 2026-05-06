// AI model provider configuration — /api/v1/ai/models.

import { apiClient } from "./client";

export interface ModelConfig {
  id: string;
  provider_name: string;
  model_name: string;
  api_key_masked: string;
  base_url: string | null;
  is_active: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string | null;
}

export interface ModelConfigList {
  items: ModelConfig[];
  total: number;
}

export interface UpsertModelConfigInput {
  provider_name: string;
  model_name: string;
  api_key: string;
  base_url?: string;
  is_active?: boolean;
  config?: Record<string, unknown>;
}

export const modelConfigApi = {
  list(): Promise<ModelConfigList> {
    return apiClient.get<ModelConfigList>("/api/v1/ai/models");
  },

  upsert(input: UpsertModelConfigInput): Promise<ModelConfig> {
    return apiClient.put<ModelConfig>("/api/v1/ai/models", input);
  },
};
