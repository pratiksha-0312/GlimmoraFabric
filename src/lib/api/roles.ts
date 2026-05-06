// Roles API module — /api/v1/roles.

import { apiClient } from "./client";

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export const rolesApi = {
  list(): Promise<Role[]> {
    return apiClient.get<Role[]>("/api/v1/roles");
  },

  create(input: { name: string; description?: string; permissions?: string[] }): Promise<Role> {
    return apiClient.post<Role>("/api/v1/roles", input);
  },

  update(roleId: string, input: { description?: string; permissions?: string[] }): Promise<Role> {
    return apiClient.put<Role>(`/api/v1/roles/${roleId}`, input);
  },

  remove(roleId: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/roles/${roleId}`);
  },
};
