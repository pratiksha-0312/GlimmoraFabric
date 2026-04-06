import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sessions — list sessions for current user
export async function GET(req: NextRequest) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const user = await prisma.platformUser.findFirst({ where: { email } });
    if (!user) return NextResponse.json([]);

    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sessions.map((s) => ({
      id: s.id,
      device: s.device,
      browser: s.browser,
      ip: s.ip,
      location: s.location,
      isCurrent: s.isCurrent,
      lastActive: s.isCurrent ? "Now" : s.updatedAt.toISOString(),
    })));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE /api/sessions — revoke a session or all other sessions
export async function DELETE(req: NextRequest) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const user = await prisma.platformUser.findFirst({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("id");

    if (sessionId) {
      // Revoke single session
      await prisma.session.delete({ where: { id: sessionId } });
    } else {
      // Revoke all other sessions
      await prisma.session.deleteMany({
        where: { userId: user.id, isCurrent: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
