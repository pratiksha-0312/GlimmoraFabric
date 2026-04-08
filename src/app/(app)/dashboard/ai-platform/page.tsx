import type { Metadata } from "next";
import { AIPlatformContent } from "@/components/dashboard/ai-platform-content";

export const metadata: Metadata = {
  title: "AI Platform - Glimmora Fabric",
  description: "AI & Agent Platform Service",
};

export default function AIPlatformPage() {
  return <AIPlatformContent />;
}
