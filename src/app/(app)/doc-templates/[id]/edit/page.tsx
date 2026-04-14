import type { Metadata } from "next";
import { DocTemplateEditor } from "@/components/admin/doc-template-editor";

export const metadata: Metadata = {
  title: "Edit Template - Glimmora Fabric",
  description: "Edit document template content and settings",
};

export default function Page() {
  return <DocTemplateEditor />;
}
