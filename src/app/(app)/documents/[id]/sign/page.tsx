import type { Metadata } from "next";
import { ESignatureRequestFlow } from "@/components/documents/e-signature-flow";

export const metadata: Metadata = {
  title: "E-Signature Request - Glimmora Fabric",
  description: "Request e-signatures for a document",
};

export default function Page() {
  return <ESignatureRequestFlow />;
}
