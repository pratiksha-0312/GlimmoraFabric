import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password - Glimmora Fabric",
  description: "Reset your Glimmora Fabric account password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
