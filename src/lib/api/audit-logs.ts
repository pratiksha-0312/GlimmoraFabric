// Audit logs — /api/v1/audit-logs/*.

import { apiClient } from "./client";

export interface AuditLog {
  id: string;
  tenant_id: string | null;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  source: string;
}

export interface AuditLogFilter {
  q?: string;
  actor_id?: string;
  action?: string;
  entity_type?: string;
  entity_id?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface CreateAuditLogInput {
  actor_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  source?: string;
}

export const auditLogsApi = {
  list(params: AuditLogFilter = {}): Promise<AuditLog[]> {
    return apiClient.get<AuditLog[]>("/api/v1/audit-logs", { query: params as Record<string, unknown> });
  },

  create(input: CreateAuditLogInput): Promise<AuditLog> {
    return apiClient.post<AuditLog>("/api/v1/audit-logs", input);
  },

  createBatch(logs: CreateAuditLogInput[]): Promise<{ created: number }> {
    return apiClient.post("/api/v1/audit-logs/batch", { logs });
  },

  // The export endpoint returns a file (CSV or JSON). We use raw mode so the
  // caller can stream/download it instead of trying to parse the envelope.
  export(input: AuditLogFilter & { format?: "csv" | "json"; limit?: number }): Promise<Response> {
    return apiClient.post<Response>("/api/v1/audit-logs/export", input, { raw: true });
  },
};
