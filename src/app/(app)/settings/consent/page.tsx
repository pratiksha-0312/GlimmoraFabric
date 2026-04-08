import type { Metadata } from "next";
import { GdprConsentPage } from "@/components/settings/gdpr-consent";

export const metadata: Metadata = {
  title: "Privacy & Consent - Glimmora Fabric",
  description: "Manage your GDPR consent and data privacy preferences",
};

export default function Page() {
  return <GdprConsentPage />;
}
