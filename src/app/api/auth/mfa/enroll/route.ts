import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateRecoveryCodes(count: number, length: number): string[] {
  const codes: string[] = [];
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < count; i++) {
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    codes.push(
      Array.from(arr)
        .map((b) => chars[b % chars.length])
        .join(""),
    );
  }
  return codes;
}

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

    const secret = randomHex(20);
    const recoveryCodes = generateRecoveryCodes(8, 8);
    const qrCodeUrl = `otpauth://totp/Glimmora:${encodeURIComponent(email)}?secret=${secret}&issuer=Glimmora`;

    await prisma.platformUser.update({
      where: { id: user.id },
      data: { mfa: true },
    });

    return NextResponse.json({ secret, qrCodeUrl, recoveryCodes });
  } catch (error) {
    console.error("MFA enroll error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
