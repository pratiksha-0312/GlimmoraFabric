import type { Metadata } from "next";
import { DeliveryLogsPage } from "@/components/admin/delivery-logs";

export const metadata: Metadata = {
  title: "Delivery Logs - Glimmora Fabric",
  description: "Track notification delivery status across all channels",
};

export default function Page() {
  return <DeliveryLogsPage />;
}
