import type { Metadata } from "next";
import { TemplateVersionHistory } from "@/components/admin/template-version-history";

export const metadata: Metadata = {
  title: "Template Version History - Glimmora Fabric",
  description: "View version history for document templates",
};

export default function Page() {
  return <TemplateVersionHistory />;
}
