import type { Metadata } from "next";
import { ConfigurationContent } from "@/components/dashboard/configuration-content";

export const metadata: Metadata = {
  title: "Configuration - Glimmora Fabric",
  description: "Platform configuration, feature flags, and secrets management",
};

export default function ConfigurationPage() {
  return <ConfigurationContent />;
}
