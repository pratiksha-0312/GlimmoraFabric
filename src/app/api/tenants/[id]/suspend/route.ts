import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const updated = await prisma.tenant.update({
    where: { id },
    data: { status: "Suspended" },
  });

  return NextResponse.json(updated);
}
