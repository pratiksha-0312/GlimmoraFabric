import type { Metadata } from "next";
import { DocTemplatePreview } from "@/components/admin/doc-template-preview";

export const metadata: Metadata = {
  title: "Template Preview - Glimmora Fabric",
  description: "Preview a rendered document template",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DocTemplatePreview templateId={id} />;
}
