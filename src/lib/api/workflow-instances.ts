// Workflow Execution — /api/v1/workflows/{id}/trigger and /api/v1/workflow-instances/*.

import { apiClient } from "./client";

export interface WorkflowStepExecution {
  id: string;
  instance_id?: string;
  step_name: string;
  order: number;
  status: string;
  is_current?: boolean;
  assigned_to: string | null;
  created_at: string;
}

export interface WorkflowInstanceTrigger {
  instance_id: string;
  workflow_definition_id: string;
  status: string;
  current_step: number;
  started_at: string;
  started_by: string;
  steps: WorkflowStepExecution[];
}

export interface ActiveInstance {
  instance_id: string;
  workflow_name: string;
  workflow_description: string | null;
  status: string;
  current_step: number;
  started_at: string;
  started_by: string;
}

export interface PaginatedActiveInstances {
  items: ActiveInstance[];
  total: number;
  page: number;
  page_size: number;
}

export interface InstanceDetail {
  instance_id: string;
  workflow_definition_id: string;
  workflow_name: string;
  workflow_description: string | null;
  status: string;
  current_step: number;
  started_at: string;
  started_by: string;
  steps: WorkflowStepExecution[];
}

export const workflowInstancesApi = {
  trigger(workflowId: string): Promise<WorkflowInstanceTrigger> {
    return apiClient.post<WorkflowInstanceTrigger>(`/api/v1/workflows/${workflowId}/trigger`);
  },

  listActive(params: { page?: number; page_size?: number; workflow_name?: string } = {}): Promise<PaginatedActiveInstances> {
    return apiClient.get<PaginatedActiveInstances>("/api/v1/workflow-instances", { query: params });
  },

  get(instanceId: string): Promise<InstanceDetail> {
    return apiClient.get<InstanceDetail>(`/api/v1/workflow-instances/${instanceId}`);
  },

  cancel(instanceId: string): Promise<{ instance_id: string; status: string }> {
    return apiClient.post(`/api/v1/workflow-instances/${instanceId}/cancel`);
  },

  retry(instanceId: string): Promise<{
    instance_id: string;
    status: string;
    retried_step_name: string;
    retried_step_order: number;
  }> {
    return apiClient.post(`/api/v1/workflow-instances/${instanceId}/retry`);
  },
};
