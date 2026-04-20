import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const docs = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    include: { template: { select: { name: true } } },
  });

  return NextResponse.json(
    docs.map((d) => ({
      id: d.id,
      name: d.name,
      templateName: d.template?.name ?? "",
      tenant: d.tenant,
      status: d.status,
      format: d.format,
      size: d.size,
      createdBy: d.createdBy,
      createdAt: d.createdAt.toISOString(),
      signedAt: d.signedAt?.toISOString() ?? null,
      signedBy: d.signedBy,
    })),
  );
}
