import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/orgs/:id/members/:uid — remove a member
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; uid: string }> }) {
  const { id, uid } = await params;

  // Verify the member belongs to this org
  const member = await prisma.platformUser.findFirst({
    where: { id: uid, tenantId: id },
  });
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  await prisma.platformUser.delete({ where: { id: uid } });
  return NextResponse.json({ success: true });
}
