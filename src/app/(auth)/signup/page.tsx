import { SignupForm } from "@/components/auth/signup-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Glimmora Fabric",
  description: "Create your Glimmora Fabric account",
};

export default function SignupPage() {
  return <SignupForm />;
}
