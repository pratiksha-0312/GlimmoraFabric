import type { Metadata } from "next";
import { DocumentPreviewPage } from "@/components/documents/document-preview";

export const metadata: Metadata = {
  title: "Document Preview - Glimmora Fabric",
  description: "Preview document and track signatures",
};

export default function Page() {
  return <DocumentPreviewPage />;
}
