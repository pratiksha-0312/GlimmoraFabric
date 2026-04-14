"use client";

import { use } from "react";
import { ReportViewer } from "@/components/admin/report-viewer";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGuard allowedRoles={["super_admin", "auditor"] as UserRole[]}>
      <ReportViewer reportId={id} />
    </AuthGuard>
  );
}
