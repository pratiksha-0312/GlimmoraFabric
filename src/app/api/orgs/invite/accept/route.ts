import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/orgs/invite/accept — accept an invitation
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, name, password } = body;

  if (!token) return NextResponse.json({ error: "Token is required" }, { status: 400 });

  const member = await prisma.platformUser.findUnique({
    where: { inviteToken: token },
  });

  if (!member) {
    return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 });
  }

  if (member.status !== "Invited") {
    return NextResponse.json({ error: "Invitation has already been accepted" }, { status: 400 });
  }

  // Update member to Active
  const updated = await prisma.platformUser.update({
    where: { id: member.id },
    data: {
      name: name || member.name,
      status: "Active",
      inviteToken: null,
      lastLogin: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    },
  });

  // Get the org name for display
  const tenant = member.tenantId
    ? await prisma.tenant.findUnique({ where: { id: member.tenantId } })
    : null;

  return NextResponse.json({
    fullName: updated.name,
    email: updated.email,
    role: updated.role,
    tenantId: updated.tenantId,
    orgName: tenant?.name ?? "",
  });
}
