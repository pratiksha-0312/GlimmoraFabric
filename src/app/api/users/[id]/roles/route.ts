import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/users/:id/roles — update a user's role
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.role) {
      return NextResponse.json(
        { error: "role is required" },
        { status: 400 },
      );
    }

    const existing = await prisma.platformUser.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = await prisma.platformUser.update({
      where: { id },
      data: { role: body.role },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("POST /api/users/[id]/roles error:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 },
    );
  }
}
