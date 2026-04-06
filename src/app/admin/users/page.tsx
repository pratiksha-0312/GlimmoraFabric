"use client";

import { IdentityContent } from "@/components/dashboard/identity-content";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

export default function IdentityPage() {
  return (
    <AuthGuard allowedRoles={["tenant_admin", "super_admin"] as UserRole[]}>
      <IdentityContent />
    </AuthGuard>
  );
}
