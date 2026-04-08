import type { Metadata } from "next";
import { ComplianceReportsPage } from "@/components/admin/compliance-reports";

export const metadata: Metadata = {
  title: "Compliance Reports - Glimmora Fabric",
  description: "View, generate, and manage compliance reports",
};

export default function Page() {
  return <ComplianceReportsPage />;
}
