import type { Metadata } from "next";
import { CreateTemplateWizard } from "@/components/admin/create-template-wizard";

export const metadata: Metadata = {
  title: "Create Template - Glimmora Fabric",
  description: "Create a new document template",
};

export default function Page() {
  return <CreateTemplateWizard />;
}
