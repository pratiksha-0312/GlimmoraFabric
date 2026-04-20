import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const versions = await prisma.documentTemplateVersion.findMany({
    where: { templateId: id },
    orderBy: { version: "desc" },
  });

  return NextResponse.json({
    templateId: id,
    versions: versions.map((v) => ({
      version: v.version,
      changedBy: v.changedBy,
      changeDescription: v.changeDescription,
      date: v.createdAt.toISOString(),
      status: v.status,
    })),
  });
}
