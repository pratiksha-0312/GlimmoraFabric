import type { Metadata } from "next";
import { ServicesContent } from "@/components/dashboard/services-content";

export const metadata: Metadata = {
  title: "Services - Glimmora Fabric",
  description: "Platform services overview",
};

export default function ServicesPage() {
  return <ServicesContent />;
}
