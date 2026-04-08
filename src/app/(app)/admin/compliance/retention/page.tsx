import type { Metadata } from "next";
import { RetentionPolicySettings } from "@/components/admin/retention-policy";

export const metadata: Metadata = {
  title: "Retention Policy - Glimmora Fabric",
  description: "Configure data retention policies for compliance",
};

export default function Page() {
  return <RetentionPolicySettings />;
}
