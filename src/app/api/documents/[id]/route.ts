import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const doc = {
    id,
    name: "Invoice #INV-2026-0142",
    templateName: "Invoice Template",
    tenant: "Acme Corp",
    status: "pending_sign",
    format: "pdf",
    size: "245 KB",
    createdBy: "Vanshika Keswani",
    createdAt: "2026-04-07T14:30:00Z",
    signedAt: null,
    signedBy: null,
    signatures: [
      { id: "sig-001", signerName: "John Smith", signerEmail: "john@acme.com", status: "signed", signedAt: "2026-04-07T16:00:00Z", ip: "192.168.1.10" },
      { id: "sig-002", signerName: "Jane Doe", signerEmail: "jane@acme.com", status: "pending", signedAt: null, ip: null },
    ],
    auditTrail: [
      { action: "Document created", actor: "Vanshika Keswani", timestamp: "2026-04-07T14:30:00Z" },
      { action: "Signature requested", actor: "Vanshika Keswani", timestamp: "2026-04-07T14:35:00Z" },
      { action: "Signed by John Smith", actor: "John Smith", timestamp: "2026-04-07T16:00:00Z" },
    ],
  };

  return NextResponse.json(doc);
}
