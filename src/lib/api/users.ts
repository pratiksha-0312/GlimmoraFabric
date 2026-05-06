// Users API module — admin user management on /api/v1/users.

import { apiClient } from "./client";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  mfa_enabled: boolean;
  last_login: string | null;
  created_at: string;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

export interface UpdateUserInput {
  full_name?: string;
  role?: string;
  is_active?: boolean;
  email_verified?: boolean;
}

export const usersApi = {
  list(params: { page?: number; page_size?: number; role?: string; is_active?: boolean; search?: string } = {}): Promise<PaginatedUsers> {
    return apiClient.get<PaginatedUsers>("/api/v1/users", { query: params });
  },

  get(userId: string): Promise<User> {
    return apiClient.get<User>(`/api/v1/users/${userId}`);
  },

  create(input: CreateUserInput): Promise<User> {
    return apiClient.post<User>("/api/v1/users", input);
  },

  update(userId: string, input: UpdateUserInput): Promise<User> {
    return apiClient.put<User>(`/api/v1/users/${userId}`, input);
  },

  remove(userId: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/users/${userId}`);
  },

  // ---- Role assignments ----------------------------------------------------

  getRoles(userId: string): Promise<Array<{ user_id: string; role_id: string; role_name: string; created_at: string }>> {
    return apiClient.get(`/api/v1/users/${userId}/roles`);
  },

  assignRole(userId: string, roleId: string): Promise<unknown> {
    return apiClient.post(`/api/v1/users/${userId}/roles`, { role_id: roleId });
  },

  // ---- Bulk import ---------------------------------------------------------

  bulkImport(file: File): Promise<{ created: unknown[]; errors: unknown[]; total_processed: number }> {
    const fd = new FormData();
    fd.append("file", file);
    return apiClient.post("/api/v1/users/import", fd);
  },
};
