"use client";

import { use } from "react";
import { TemplateEditorPage } from "@/components/admin/template-editor";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <TemplateEditorPage templateId={id} />;
}
