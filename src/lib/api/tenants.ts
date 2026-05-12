// Tenants API — /api/v1/tenants. These are platform-admin endpoints, so we
// pass `tenantId: null` to suppress the auto-injected X-Tenant-ID header.

import { apiClient } from "./client";

export interface Tenant {
  id: string;
  name: string;
  code: string;
  contact_email: string;
  domain: string | null;
  contact_phone: string | null;
  address: string | null;
  status: string;
  region: string;
  features: string; // JSON string from the backend; parse client-side
  config: string;
  is_deleted: boolean;
  deleted_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PaginatedTenants {
  items: Tenant[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTenantInput {
  name: string;
  code: string;
  contact_email: string;
  domain?: string;
  contact_phone?: string;
  address?: string;
  region?: string;
  features?: Record<string, unknown>;
  config?: Record<string, unknown>;
  // Optional: when set, the backend also provisions a tenant_admin user with
  // email=contact_email and links it via user_tenants.
  admin_password?: string;
  admin_full_name?: string;
}

export interface UpdateTenantInput {
  name?: string;
  code?: string;
  contact_email?: string;
  domain?: string;
  contact_phone?: string;
  address?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  region?: string;
  features?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

export interface ListTenantsParams {
  page?: number;
  limit?: number;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  search?: string;
  code?: string;
  sort_by?: "created_at" | "name" | "code" | "status";
  order?: "asc" | "desc";
}

export interface TenantUsage {
  resource_type: string;
  used: number;
  period_start: string;
  period_end: string;
}

export const tenantsApi = {
  list(params: ListTenantsParams = {}): Promise<PaginatedTenants> {
    return apiClient.get<PaginatedTenants>("/api/v1/tenants/", {
      query: params as Record<string, unknown>,
      tenantId: null,
    });
  },

  get(tenantId: string): Promise<Tenant> {
    return apiClient.get<Tenant>(`/api/v1/tenants/${tenantId}`, { tenantId: null });
  },

  create(input: CreateTenantInput): Promise<Tenant> {
    return apiClient.post<Tenant>("/api/v1/tenants/", input, { tenantId: null });
  },

  update(tenantId: string, input: UpdateTenantInput): Promise<Tenant> {
    return apiClient.put<Tenant>(`/api/v1/tenants/${tenantId}`, input, { tenantId: null });
  },

  remove(tenantId: string, reason?: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/tenants/${tenantId}`, {
      body: reason ? { reason } : undefined,
      tenantId: null,
    });
  },

  // ---- Lifecycle -----------------------------------------------------------

  activate(tenantId: string): Promise<Tenant> {
    return apiClient.post<Tenant>(`/api/v1/tenants/${tenantId}/activate`, undefined, { tenantId: null });
  },

  suspend(tenantId: string, reason?: string): Promise<Tenant> {
    return apiClient.post<Tenant>(
      `/api/v1/tenants/${tenantId}/suspend`,
      reason ? { reason } : undefined,
      { tenantId: null },
    );
  },

  reactivate(tenantId: string, reason?: string): Promise<Tenant> {
    return apiClient.post<Tenant>(
      `/api/v1/tenants/${tenantId}/reactivate`,
      reason ? { reason } : undefined,
      { tenantId: null },
    );
  },

  updateRegion(tenantId: string, input: { region: string; domain?: string | null }): Promise<Tenant> {
    return apiClient.put<Tenant>(`/api/v1/tenants/${tenantId}/region`, input, { tenantId: null });
  },

  // ---- Usage ---------------------------------------------------------------

  getUsage(
    tenantId: string,
    params: { resource_type?: string; start_date?: string; end_date?: string } = {},
  ): Promise<TenantUsage[]> {
    return apiClient.get<TenantUsage[]>(`/api/v1/tenants/${tenantId}/usage`, {
      query: params,
      tenantId: null,
    });
  },

  // ---- User assignment -----------------------------------------------------

  assignUser(tenantId: string, input: { user_id: string; role_in_tenant?: string }): Promise<unknown> {
    return apiClient.post(`/api/v1/tenants/${tenantId}/users`, input, { tenantId: null });
  },
};
