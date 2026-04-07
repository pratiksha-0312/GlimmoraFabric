"use client";

import { IdentityContent } from "@/components/dashboard/identity-content";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

export default function TenantAdminUsersPage() {
  return (
    <AuthGuard allowedRoles={["tenant_admin"] as UserRole[]}>
      <IdentityContent mode="tenant_admin" />
    </AuthGuard>
  );
}
