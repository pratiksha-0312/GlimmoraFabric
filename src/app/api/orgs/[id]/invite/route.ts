import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// POST /api/orgs/:id/invite — invite a member
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Verify the org exists
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    // Check if already a member
    const existing = await prisma.platformUser.findFirst({
      where: { email: body.email, tenantId: id },
    });
    if (existing) {
      return NextResponse.json({ error: "User is already a member of this organization" }, { status: 409 });
    }

    // Generate invite token
    const inviteToken = generateToken();

    const member = await prisma.platformUser.create({
      data: {
        name: body.email.split("@")[0],
        email: body.email,
        role: body.role ?? "developer",
        status: "Invited",
        tenant: tenant.name,
        tenantRef: { connect: { id } },
        inviteToken,
        joinedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      },
    });

    // In production, send email with invite link. For now, return the token.
    const inviteUrl = `/invite/${inviteToken}`;

    return NextResponse.json({
      id: member.id,
      email: member.email,
      role: member.role,
      status: member.status,
      inviteUrl,
    }, { status: 201 });
  } catch (err) {
    console.error("Invite error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
