import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/orgs/:id/members — list members of this org
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const members = await prisma.platformUser.findMany({
    where: { tenantId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    members.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      status: m.status,
      joinedDate: m.joinedDate,
      lastLogin: m.lastLogin,
    })),
  );
}
