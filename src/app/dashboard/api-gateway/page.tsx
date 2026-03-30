import type { Metadata } from "next";
import { APIGatewayContent } from "@/components/dashboard/api-gateway-content";

export const metadata: Metadata = {
  title: "API Gateway & Keys - Glimmora Fabric",
  description: "API Gateway management, routing rules, and API key administration",
};

export default function APIGatewayPage() {
  return <APIGatewayContent />;
}
