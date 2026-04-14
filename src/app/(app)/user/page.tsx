"use client";

import { IdentityContent } from "@/components/dashboard/identity-content";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

export default function SuperAdminUsersPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"] as UserRole[]}>
      <IdentityContent mode="super_admin" />
    </AuthGuard>
  );
}
