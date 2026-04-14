"use client";

import { DataExportPage } from "@/components/admin/data-export";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

export default function Page() {
  return (
    <AuthGuard allowedRoles={["super_admin", "auditor"] as UserRole[]}>
      <DataExportPage />
    </AuthGuard>
  );
}
