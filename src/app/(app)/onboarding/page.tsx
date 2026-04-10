import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Onboarding - Glimmora Fabric",
  description: "Set up your workspace",
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
