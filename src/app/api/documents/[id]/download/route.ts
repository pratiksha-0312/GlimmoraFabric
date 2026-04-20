import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Placeholder: no real file storage yet. We return a plain-text stand-in that
// reflects the document's actual metadata so downloads are at least informative.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const doc = await prisma.document.findUnique({
    where: { id },
    include: { template: true, signatures: { orderBy: { sortOrder: "asc" } } },
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const lines = [
    `DOCUMENT: ${doc.name}`,
    "=".repeat(60),
    `ID: ${doc.id}`,
    `Template: ${doc.template?.name ?? "—"}`,
    `Tenant: ${doc.tenant}`,
    `Status: ${doc.status}`,
    `Format: ${doc.format}`,
    `Size: ${doc.size}`,
    `Created By: ${doc.createdBy}`,
    `Created At: ${doc.createdAt.toISOString()}`,
    doc.signedAt ? `Signed At: ${doc.signedAt.toISOString()}` : "",
    doc.signedBy ? `Signed By: ${doc.signedBy}` : "",
    "",
    "SIGNATURES",
    "-".repeat(40),
    ...(doc.signatures.length === 0
      ? ["(none)"]
      : doc.signatures.map((s) => `[${s.status.toUpperCase()}] ${s.signerName} <${s.signerEmail}>${s.signedAt ? ` — signed ${s.signedAt.toISOString()}` : ""}`)),
    "",
    doc.template?.content
      ? `RENDERED TEMPLATE CONTENT\n${"-".repeat(40)}\n${doc.template.content}`
      : "",
  ].filter(Boolean);

  const body = lines.join("\n");
  const filename = `${doc.name.replace(/\s+/g, "-").toLowerCase()}.txt`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
