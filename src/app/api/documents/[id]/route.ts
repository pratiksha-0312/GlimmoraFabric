import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type AuditEntry = { action: string; actor: string; timestamp: string };

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      template: { select: { name: true } },
      signatures: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let auditTrail: AuditEntry[] = [];
  try { auditTrail = JSON.parse(doc.auditJson || "[]"); } catch { auditTrail = []; }

  return NextResponse.json({
    id: doc.id,
    name: doc.name,
    templateName: doc.template?.name ?? "",
    tenant: doc.tenant,
    status: doc.status,
    format: doc.format,
    size: doc.size,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
    signedAt: doc.signedAt?.toISOString() ?? null,
    signedBy: doc.signedBy,
    signatures: doc.signatures.map((s) => ({
      id: s.id,
      signerName: s.signerName,
      signerEmail: s.signerEmail,
      status: s.status,
      signedAt: s.signedAt?.toISOString() ?? null,
      ip: s.ip,
    })),
    auditTrail,
  });
}
