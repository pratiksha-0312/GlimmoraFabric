import type { Metadata } from "next";
import { AuditLogViewer } from "@/components/admin/audit-log-viewer";

export const metadata: Metadata = {
  title: "Audit Log Viewer - Glimmora Fabric",
  description: "Browse, search, and export the immutable audit trail",
};

export default function AuditLogsPage() {
  return <AuditLogViewer />;
}
