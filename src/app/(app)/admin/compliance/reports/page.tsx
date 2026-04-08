"use client";

import { ComplianceReportsPage } from "@/components/admin/compliance-reports";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

export default function Page() {
  return (
    <AuthGuard allowedRoles={["super_admin", "auditor"] as UserRole[]}>
      <ComplianceReportsPage />
    </AuthGuard>
  );
}
