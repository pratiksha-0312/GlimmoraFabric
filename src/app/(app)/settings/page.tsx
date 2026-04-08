import type { Metadata } from "next";
import { SettingsContent } from "@/components/dashboard/settings-content";

export const metadata: Metadata = {
  title: "Settings - Glimmora Fabric",
  description: "Platform settings",
};

export default function SettingsPage() {
  return <SettingsContent />;
}
