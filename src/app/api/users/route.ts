import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users — list all users
export async function GET() {
  const users = await prisma.platformUser.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(users);
}

// POST /api/users — create a new user
export async function POST(req: NextRequest) {
  const body = await req.json();
  const user = await prisma.platformUser.create({
    data: {
      name: body.name,
      email: body.email ?? "",
      role: body.role ?? "tenant_member",
      status: body.status ?? "Active",
      mfa: body.mfa ?? false,
      lastLogin: body.lastLogin ?? "—",
      tenant: body.tenant ?? "",
      tenantId: body.tenantId ?? null,
      joinedDate: body.joinedDate ?? new Date().toISOString().slice(0, 10),
    },
  });
  return NextResponse.json(user, { status: 201 });
}
