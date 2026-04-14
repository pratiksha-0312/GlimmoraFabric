import type { Metadata } from "next";
import { MonitoringContent } from "@/components/dashboard/monitoring-content";

export const metadata: Metadata = {
  title: "Monitoring & Logs - Glimmora Fabric",
  description: "System monitoring, service health, and centralized log management",
};

export default function MonitoringPage() {
  return <MonitoringContent />;
}
