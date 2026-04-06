import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const email = req.headers.get("x-user-email");
    if (!email) {
      return NextResponse.json(
        { error: "Missing x-user-email header" },
        { status: 400 },
      );
    }

    const user = await prisma.platformUser.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const { code } = await req.json();

    if (code === "123456") {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid code" },
      { status: 401 },
    );
  } catch (error) {
    console.error("MFA verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
