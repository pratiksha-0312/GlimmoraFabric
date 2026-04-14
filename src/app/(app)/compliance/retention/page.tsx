"use client";

import { RetentionPolicySettings } from "@/components/admin/retention-policy";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

export default function Page() {
  return (
    <AuthGuard allowedRoles={["super_admin"] as UserRole[]}>
      <RetentionPolicySettings />
    </AuthGuard>
  );
}
