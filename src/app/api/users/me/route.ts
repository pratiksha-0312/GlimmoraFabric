import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/me — get current user profile by email header
export async function GET(req: NextRequest) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const user = await prisma.platformUser.findFirst({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      jobTitle: user.jobTitle,
      bio: user.bio,
      timezone: user.timezone,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PUT /api/users/me — update current user profile
export async function PUT(req: NextRequest) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const user = await prisma.platformUser.findFirst({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.jobTitle !== undefined) data.jobTitle = body.jobTitle;
    if (body.bio !== undefined) data.bio = body.bio;
    if (body.timezone !== undefined) data.timezone = body.timezone;
    if (body.avatarUrl !== undefined) data.avatarUrl = body.avatarUrl;

    const updated = await prisma.platformUser.update({ where: { id: user.id }, data });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      jobTitle: updated.jobTitle,
      bio: updated.bio,
      timezone: updated.timezone,
      avatarUrl: updated.avatarUrl,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
