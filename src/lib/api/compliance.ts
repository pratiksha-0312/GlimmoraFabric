// Compliance — /api/v1/compliance/*. SOC2 / GDPR reports, retention policy,
// and GDPR right-to-access / right-to-be-forgotten.

import { apiClient } from "./client";

export type ComplianceReportType = "soc2" | "gdpr";

export interface ComplianceReport {
  id: string;
  tenant_id: string;
  type: ComplianceReportType;
  status: string;
  file_path: string;
  created_at: string;
}

export interface RetentionPolicy {
  id: string;
  tenant_id: string;
  retention_days: number;
  auto_purge_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface GDPRDeleteResult {
  user_id: string;
  user_deleted: boolean;
  user_anonymized: boolean;
  audit_logs_masked: number;
}

export const complianceApi = {
  // ---- Reports -------------------------------------------------------------

  generateSoc2(includeSummary = true): Promise<ComplianceReport> {
    return apiClient.post<ComplianceReport>("/api/v1/compliance/reports/soc2", {
      include_summary: includeSummary,
    });
  },

  generateGdpr(includeSummary = true): Promise<ComplianceReport> {
    return apiClient.post<ComplianceReport>("/api/v1/compliance/reports/gdpr", {
      include_summary: includeSummary,
    });
  },

  listReports(): Promise<ComplianceReport[]> {
    return apiClient.get<ComplianceReport[]>("/api/v1/compliance/reports");
  },

  getReportPdf(reportId: string): Promise<{ id: string; file_path: string; status: string }> {
    return apiClient.get(`/api/v1/compliance/reports/${reportId}/pdf`);
  },

  // ---- Retention policy ----------------------------------------------------

  getRetentionPolicy(): Promise<RetentionPolicy> {
    return apiClient.get<RetentionPolicy>("/api/v1/compliance/retention");
  },

  updateRetentionPolicy(input: {
    retention_days: number;
    auto_purge_enabled: boolean;
  }): Promise<RetentionPolicy> {
    return apiClient.put<RetentionPolicy>("/api/v1/compliance/retention", input);
  },

  // ---- GDPR ----------------------------------------------------------------

  // "Right to access" — return everything we hold about the user.
  exportUserData(userId: string): Promise<Record<string, unknown>> {
    return apiClient.post<Record<string, unknown>>("/api/v1/compliance/data-export", {
      user_id: userId,
    });
  },

  // "Right to be forgotten". `anonymize_only=true` (default) preserves rows
  // but strips PII; pass `false` to hard-delete the user record.
  deleteUserData(input: { user_id: string; anonymize_only?: boolean }): Promise<GDPRDeleteResult> {
    return apiClient.post<GDPRDeleteResult>("/api/v1/compliance/data-delete", {
      anonymize_only: true,
      ...input,
    });
  },
};
