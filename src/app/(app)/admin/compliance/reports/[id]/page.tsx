"use client";

import { use } from "react";
import { ReportViewer } from "@/components/admin/report-viewer";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ReportViewer reportId={id} />;
}
