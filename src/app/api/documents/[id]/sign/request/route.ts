import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type AuditEntry = { action: string; actor: string; timestamp: string };

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({} as Record<string, unknown>));

  const signerName = typeof body.signerName === "string" ? body.signerName.trim() : "";
  const signerEmail = typeof body.signerEmail === "string" ? body.signerEmail.trim() : "";

  if (!signerName || !signerEmail) {
    return NextResponse.json({ error: "signerName and signerEmail are required" }, { status: 400 });
  }

  const doc = await prisma.document.findUnique({
    where: { id },
    include: { signatures: true },
  });
  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  const requestedBy = req.headers.get("x-user-name") || "Current User";

  const signature = await prisma.documentSignature.create({
    data: {
      documentId: id,
      signerName,
      signerEmail,
      status: "pending",
      sortOrder: doc.signatures.length,
    },
  });

  // Append an audit entry and flip the doc to pending_sign if it wasn't already signed.
  let audit: AuditEntry[] = [];
  try { audit = JSON.parse(doc.auditJson || "[]"); } catch { audit = []; }
  audit.push({
    action: `Signature requested for ${signerName}`,
    actor: requestedBy,
    timestamp: new Date().toISOString(),
  });

  await prisma.document.update({
    where: { id },
    data: {
      auditJson: JSON.stringify(audit),
      status: doc.status === "signed" ? doc.status : "pending_sign",
    },
  });

  return NextResponse.json({
    id: signature.id,
    documentId: id,
    signatureId: signature.id,
    signerName: signature.signerName,
    signerEmail: signature.signerEmail,
    status: signature.status,
    requestedAt: signature.requestedAt.toISOString(),
  }, { status: 201 });
}
