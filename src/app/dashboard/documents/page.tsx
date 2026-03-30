import type { Metadata } from "next";
import { DocumentsContent } from "@/components/dashboard/documents-content";

export const metadata: Metadata = {
  title: "Documents - Glimmora Fabric",
  description: "Document & Template Service",
};

export default function DocumentsPage() {
  return <DocumentsContent />;
}
