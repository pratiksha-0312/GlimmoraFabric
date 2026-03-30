import type { Metadata } from "next";
import { DeveloperToolsContent } from "@/components/dashboard/developer-tools-content";

export const metadata: Metadata = {
  title: "Developer Tools - Glimmora Fabric",
  description: "SDKs, API playground, starter repos, and CI/CD templates",
};

export default function DeveloperToolsPage() {
  return <DeveloperToolsContent />;
}
