// Workflows — /api/v1/workflows/*. Tenant-scoped (X-Tenant-ID auto-injected).
//
// Two related modules:
//   - workflows.ts    — definitions, SLA, escalation rules, approval matrix
//   - workflow-instances.ts — runtime: trigger, list, cancel, retry
//   - tasks.ts        — task inbox / approve / reject / reassign / comments

import { apiClient } from "./client";

// ---- Definition shapes ------------------------------------------------------

export interface WorkflowStep {
  id: string;
  step_name: string;
  order: number;
  created_at: string;
}

export interface WorkflowStepInput {
  step_name: string;
  order: number;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string | null;
  tenant_id: string;
  created_by: string;
  steps: WorkflowStep[];
  created_at: string;
  updated_at: string | null;
}

export interface PaginatedWorkflows {
  items: WorkflowDefinition[];
  total: number;
  page: number;
  page_size: number;
}

export interface WorkflowVersion {
  id: string;
  workflow_id: string;
  version_number: number;
  name: string;
  description: string | null;
  steps: { step_name: string; order: number }[];
  created_at: string;
  created_by: string;
}

// ---- Escalation rules -------------------------------------------------------

export type EscalationNotificationType = "EMAIL" | "SMS" | "WEBHOOK" | "IN_APP";

export interface EscalationRule {
  id: string;
  workflow_id: string;
  escalation_after_minutes: number;
  escalate_to_role: string;
  notification_type: EscalationNotificationType;
  created_at: string;
  updated_at: string | null;
}

export interface UpsertEscalationRuleInput {
  workflow_id: string;
  escalation_after_minutes: number;
  escalate_to_role: string;
  notification_type?: EscalationNotificationType;
}

// ---- Approval matrix --------------------------------------------------------

export type ApproverType = "USER" | "ROLE";

export interface ApprovalLevelInput {
  level: number; // must be sequential starting from 1
  approver_type: ApproverType;
  approver_id: string;
}

// ---- SLA --------------------------------------------------------------------

export interface SLAConfig {
  workflow_id: string;
  sla_duration_minutes: number;
  escalation_enabled: boolean;
  escalation_after_minutes: number | null;
}

export interface SLAStatusItem {
  workflow_id: string;
  workflow_name: string;
  total: number;
  within_sla: number;
  near_breach: number;
  breached: number;
}

// ---- Module -----------------------------------------------------------------

export const workflowsApi = {
  list(params: { page?: number; page_size?: number; search?: string } = {}): Promise<PaginatedWorkflows> {
    return apiClient.get<PaginatedWorkflows>("/api/v1/workflows", { query: params });
  },

  get(workflowId: string): Promise<WorkflowDefinition> {
    return apiClient.get<WorkflowDefinition>(`/api/v1/workflows/${workflowId}`);
  },

  create(input: { name: string; description?: string; steps: WorkflowStepInput[] }): Promise<WorkflowDefinition> {
    return apiClient.post<WorkflowDefinition>("/api/v1/workflows", input);
  },

  update(workflowId: string, input: { name: string; description?: string; steps: WorkflowStepInput[] }): Promise<WorkflowDefinition> {
    return apiClient.put<WorkflowDefinition>(`/api/v1/workflows/${workflowId}`, input);
  },

  listVersions(workflowId: string): Promise<WorkflowVersion[]> {
    return apiClient.get<WorkflowVersion[]>(`/api/v1/workflows/${workflowId}/versions`);
  },

  // ---- SLA -----------------------------------------------------------------

  configureSla(
    workflowId: string,
    input: { sla_duration_minutes: number; escalation_enabled: boolean; escalation_after_minutes?: number },
  ): Promise<SLAConfig> {
    return apiClient.put<SLAConfig>(`/api/v1/workflows/${workflowId}/sla`, input);
  },

  getSlaStatus(workflowId?: string): Promise<{ items: SLAStatusItem[] }> {
    return apiClient.get(`/api/v1/workflows/sla-status`, {
      query: workflowId ? { workflow_id: workflowId } : undefined,
    });
  },

  // ---- Escalation rules ----------------------------------------------------

  listEscalationRules(workflowId?: string): Promise<EscalationRule[]> {
    return apiClient.get<EscalationRule[]>(`/api/v1/workflows/escalations`, {
      query: workflowId ? { workflow_id: workflowId } : undefined,
    });
  },

  upsertEscalationRule(input: UpsertEscalationRuleInput): Promise<EscalationRule> {
    return apiClient.put<EscalationRule>(`/api/v1/workflows/escalations`, input);
  },

  // ---- Approval matrix -----------------------------------------------------

  defineApprovalMatrix(input: { workflow_id: string; levels: ApprovalLevelInput[] }): Promise<{ workflow_id: string; levels_count: number }> {
    return apiClient.post(`/api/v1/workflows/approval-matrix`, input);
  },
};
