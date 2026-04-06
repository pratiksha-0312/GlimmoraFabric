import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = await req.json();
    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json(
        { error: "x-user-email header is required" },
        { status: 400 },
      );
    }

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required" },
        { status: 400 },
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 },
      );
    }

    // Look up tenant by email or username
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { email: { equals: userEmail, mode: "insensitive" } },
          { username: { equals: userEmail, mode: "insensitive" } },
        ],
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 },
      );
    }

    if (tenant.password !== currentPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 },
      );
    }

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { password: newPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
