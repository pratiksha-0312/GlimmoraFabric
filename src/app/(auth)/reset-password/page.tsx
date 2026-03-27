import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password - Glimmora Fabric",
  description: "Set a new password for your Glimmora Fabric account",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
