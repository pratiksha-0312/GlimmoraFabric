import type { Metadata } from "next";
import { AllNotificationsPage } from "@/components/notifications/all-notifications";

export const metadata: Metadata = {
  title: "Notifications - Glimmora Fabric",
  description: "View all your notifications",
};

export default function Page() {
  return <AllNotificationsPage />;
}
