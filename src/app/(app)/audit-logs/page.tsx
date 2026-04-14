"use client";

import { AuditLogViewer } from "@/components/admin/audit-log-viewer";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

export default function AuditLogsPage() {
  return (
    <AuthGuard allowedRoles={["super_admin", "auditor"] as UserRole[]}>
      <AuditLogViewer />
    </AuthGuard>
  );
}
