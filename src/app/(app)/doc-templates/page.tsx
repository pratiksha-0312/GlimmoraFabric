import type { Metadata } from "next";
import { DocTemplateListPage } from "@/components/admin/doc-template-list";

export const metadata: Metadata = {
  title: "Document Templates - Glimmora Fabric",
  description: "Manage document templates for all tenants",
};

export default function Page() {
  return <DocTemplateListPage />;
}
