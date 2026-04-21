import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const key = await prisma.studioApiKey.findUnique({ where: { id } });
  if (!key) return NextResponse.json({ error: "Key not found" }, { status: 404 });

  await prisma.studioApiKey.update({
    where: { id },
    data: { status: "revoked", revokedAt: new Date() },
  });
  return NextResponse.json({ success: true });
}
