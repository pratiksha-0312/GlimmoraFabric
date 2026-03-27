import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Glimmora Fabric",
  description: "Sign in to your Glimmora Fabric account",
};

export default function LoginPage() {
  return <LoginForm />;
}
