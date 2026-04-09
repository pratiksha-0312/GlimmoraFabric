import type { Metadata } from "next";
import { DocumentListPage } from "@/components/documents/document-list";

export const metadata: Metadata = {
  title: "Documents - Glimmora Fabric",
  description: "Browse and manage your documents",
};

export default function Page() {
  return <DocumentListPage />;
}
