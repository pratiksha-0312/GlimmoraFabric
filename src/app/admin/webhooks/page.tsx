import type { Metadata } from "next";
import { WebhookManagementPage } from "@/components/admin/webhook-management";

export const metadata: Metadata = {
  title: "Webhook Management - Glimmora Fabric",
  description: "Configure and monitor webhook endpoints for event-driven integrations",
};

export default function Page() {
  return <WebhookManagementPage />;
}
