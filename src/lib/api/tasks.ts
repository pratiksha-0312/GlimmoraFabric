// Tasks (workflow inbox) — /api/v1/tasks/*.

import { apiClient } from "./client";

export interface TaskItem {
  task_id: string;
  step_name: string;
  status: string;
  workflow_name: string;
  instance_id: string;
  created_at: string;
}

export interface PaginatedTasks {
  items: TaskItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface TaskDetail {
  task_id: string;
  step_name: string;
  order: number;
  status: string;
  assigned_to: string | null;
  workflow_name: string;
  workflow_description: string | null;
  instance_id: string;
  instance_status: string;
  created_at: string;
}

export interface TaskComment {
  id: string;
  comment: string;
  created_by: string;
  created_at: string;
}

export const tasksApi = {
  // Inbox view — tasks assigned to the current user.
  myTasks(params: { page?: number; page_size?: number; status?: string } = {}): Promise<PaginatedTasks> {
    return apiClient.get<PaginatedTasks>("/api/v1/tasks/my", { query: params });
  },

  get(taskId: string): Promise<TaskDetail> {
    return apiClient.get<TaskDetail>(`/api/v1/tasks/${taskId}`);
  },

  approve(taskId: string): Promise<{ task_id: string; status: string }> {
    return apiClient.post(`/api/v1/tasks/${taskId}/approve`);
  },

  reject(taskId: string, reason: string): Promise<{ task_id: string; status: string }> {
    return apiClient.post(`/api/v1/tasks/${taskId}/reject`, { reason });
  },

  reassign(taskId: string, assignedTo: string): Promise<{ task_id: string; assigned_to: string }> {
    return apiClient.post(`/api/v1/tasks/${taskId}/reassign`, { assigned_to: assignedTo });
  },

  // ---- Comments ------------------------------------------------------------

  listComments(taskId: string): Promise<TaskComment[]> {
    return apiClient.get<TaskComment[]>(`/api/v1/tasks/${taskId}/comments`);
  },

  addComment(taskId: string, comment: string): Promise<TaskComment> {
    return apiClient.post<TaskComment>(`/api/v1/tasks/${taskId}/comments`, { comment });
  },
};
