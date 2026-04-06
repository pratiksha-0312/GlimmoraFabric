import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/roles/:id/users — list users assigned to this role
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

    const users = await prisma.platformUser.findMany({
      where: { role: role.name },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      status: u.status,
      lastLogin: u.lastLogin,
    })));
  } catch (err) {
    console.error("GET /api/roles/:id/users error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/roles/:id/users — assign a user to this role
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

    // Check if user with this email already exists
    const existing = await prisma.platformUser.findFirst({ where: { email: body.email } });
    if (existing) {
      // Update existing user's role
      const updated = await prisma.platformUser.update({
        where: { id: existing.id },
        data: { role: role.name },
      });
      return NextResponse.json({
        id: updated.id, name: updated.name, email: updated.email,
        status: updated.status, lastLogin: updated.lastLogin,
      });
    }

    // Create new user with this role
    const user = await prisma.platformUser.create({
      data: {
        name: body.name,
        email: body.email,
        role: role.name,
        status: "Active",
        joinedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      },
    });

    return NextResponse.json({
      id: user.id, name: user.name, email: user.email,
      status: user.status, lastLogin: user.lastLogin,
    }, { status: 201 });
  } catch (err) {
    console.error("POST /api/roles/:id/users error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
