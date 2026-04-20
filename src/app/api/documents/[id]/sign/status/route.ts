import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const doc = await prisma.document.findUnique({
    where: { id },
    include: { signatures: { orderBy: { sortOrder: "asc" } } },
  });
  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  const signatures = doc.signatures;
  const total = signatures.length;
  const signed = signatures.filter((s) => s.status === "signed").length;
  const declined = signatures.filter((s) => s.status === "declined").length;
  const pending = total - signed - declined;

  let overall: "not_requested" | "pending" | "partially_signed" | "signed" | "declined";
  if (total === 0) overall = "not_requested";
  else if (declined > 0) overall = "declined";
  else if (signed === total) overall = "signed";
  else if (signed > 0) overall = "partially_signed";
  else overall = "pending";

  return NextResponse.json({
    documentId: id,
    status: overall,
    counts: { total, signed, pending, declined },
    signatures: signatures.map((s) => ({
      id: s.id,
      documentId: id,
      signatureId: s.id,
      signerName: s.signerName,
      signerEmail: s.signerEmail,
      status: s.status,
      requestedAt: s.requestedAt.toISOString(),
      signedAt: s.signedAt?.toISOString() ?? null,
      ip: s.ip,
    })),
  });
}
