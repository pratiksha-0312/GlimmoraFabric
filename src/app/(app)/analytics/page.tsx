import type { Metadata } from "next";
import { AnalyticsContent } from "@/components/dashboard/analytics-content";

export const metadata: Metadata = {
  title: "Analytics - Glimmora Fabric",
  description: "Cross-Product Analytics & Reports",
};

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}
