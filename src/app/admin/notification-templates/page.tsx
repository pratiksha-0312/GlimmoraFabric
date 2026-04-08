import type { Metadata } from "next";
import { NotificationTemplatesPage } from "@/components/admin/notification-templates";

export const metadata: Metadata = {
  title: "Notification Templates - Glimmora Fabric",
  description: "Manage and customize notification templates across all channels",
};

export default function Page() {
  return <NotificationTemplatesPage />;
}
