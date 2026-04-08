import type { Metadata } from "next";
import { NotificationPreferences } from "@/components/settings/notification-preferences";

export const metadata: Metadata = {
  title: "Notification Preferences - Glimmora Fabric",
  description: "Manage your notification channels and categories",
};

export default function Page() {
  return <NotificationPreferences />;
}
