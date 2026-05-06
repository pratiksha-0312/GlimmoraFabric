// Organizations / Tenants invitation API — /api/v1/orgs.

import { apiClient } from "./client";

export interface Invitation {
  id: string;
  tenant_id: string;
  email: string;
  role_in_tenant: string;
  invited_by: string;
  status: string;
  expires_at: string;
  created_at: string;
  invitation_token?: string;
}

export interface TenantMember {
  user_id: string;
  email: string;
  full_name: string;
  role_in_tenant: string;
  is_active: boolean;
  joined_at: string;
}

export const orgsApi = {
  invite(tenantId: string, input: { email: string; role_in_tenant?: string }): Promise<Invitation> {
    return apiClient.post<Invitation>(`/api/v1/orgs/${tenantId}/invite`, input);
  },

  acceptInvitation(token: string): Promise<{ tenant_id: string; role_in_tenant: string }> {
    return apiClient.post("/api/v1/orgs/invite/accept", { token });
  },

  listInvitations(tenantId: string, status?: string): Promise<Invitation[]> {
    return apiClient.get<Invitation[]>(`/api/v1/orgs/${tenantId}/invitations`, { query: { status } });
  },

  revokeInvitation(tenantId: string, invitationId: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/orgs/${tenantId}/invitations/${invitationId}`);
  },

  listMembers(tenantId: string): Promise<TenantMember[]> {
    return apiClient.get<TenantMember[]>(`/api/v1/orgs/${tenantId}/members`);
  },

  removeMember(tenantId: string, userId: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/orgs/${tenantId}/members/${userId}`);
  },

  updateMemberRole(tenantId: string, userId: string, roleInTenant: string): Promise<void> {
    return apiClient.put<void>(`/api/v1/orgs/${tenantId}/members/${userId}/role`, {
      role_in_tenant: roleInTenant,
    });
  },
};
