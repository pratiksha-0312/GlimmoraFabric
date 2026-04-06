import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateTokenString() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return "gfb_" + Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 40);
}

// GET /api/tokens — list tokens for current user
export async function GET(req: NextRequest) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const user = await prisma.platformUser.findFirst({ where: { email } });
    if (!user) return NextResponse.json([]);

    const tokens = await prisma.apiToken.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tokens.map((t) => ({
      id: t.id,
      name: t.name,
      scopes: t.scopes.split(","),
      created: t.createdAt.toISOString().split("T")[0],
      expires: t.expiresAt ? t.expiresAt.toISOString().split("T")[0] : "Never",
      lastUsed: t.lastUsed ? t.lastUsed.toISOString().split("T")[0] : "Never",
    })));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/tokens — create a new token
export async function POST(req: NextRequest) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const user = await prisma.platformUser.findFirst({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const tokenStr = generateTokenString();

    let expiresAt: Date | null = null;
    if (body.expiry && body.expiry !== "never") {
      expiresAt = new Date(Date.now() + parseInt(body.expiry) * 86400000);
    }

    const scopes = (body.scopes ?? ["read"]).join(",");

    const token = await prisma.apiToken.create({
      data: {
        userId: user.id,
        name: body.name ?? "Untitled Token",
        token: tokenStr,
        scopes,
        expiresAt,
      },
    });

    return NextResponse.json({
      id: token.id,
      name: token.name,
      token: tokenStr,
      scopes: token.scopes.split(","),
      created: token.createdAt.toISOString().split("T")[0],
      expires: token.expiresAt ? token.expiresAt.toISOString().split("T")[0] : "Never",
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE /api/tokens — revoke a token
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Token ID required" }, { status: 400 });

    await prisma.apiToken.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
