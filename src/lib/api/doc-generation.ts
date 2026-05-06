// Document Generation — /api/v1/doc-generation/*.

import { apiClient } from "./client";

export type DocumentFormat = "pdf" | "docx";

export interface GeneratedDocument {
  document_id: string;
  template_id: string;
  file_name: string;
  file_url: string;
  status: string;
  created_by: string;
  created_at: string;
}

export interface BatchItemResult {
  index: number;
  status: "GENERATED" | "FAILED" | string;
  document_id: string | null;
  file_url: string | null;
  error: string | null;
}

export const docGenerationApi = {
  generate(input: {
    template_id: string;
    data?: Record<string, unknown>;
    format?: DocumentFormat;
  }): Promise<GeneratedDocument> {
    return apiClient.post<GeneratedDocument>("/api/v1/doc-generation/generate", {
      data: {},
      format: "pdf",
      ...input,
    });
  },

  // Batch (1–100 items). Each item is rendered separately and one row in the
  // result tells you whether it succeeded.
  batchGenerate(input: {
    template_id: string;
    format?: DocumentFormat;
    items: { data?: Record<string, unknown> }[];
  }): Promise<BatchItemResult[]> {
    return apiClient.post<BatchItemResult[]>("/api/v1/doc-generation/batch-generate", {
      format: "pdf",
      ...input,
    });
  },
};
