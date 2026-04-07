import type { Metadata } from "next";
import { DataExportPage } from "@/components/admin/data-export";

export const metadata: Metadata = {
  title: "Data Export - Glimmora Fabric",
  description: "Request and manage compliance data exports",
};

export default function Page() {
  return <DataExportPage />;
}
