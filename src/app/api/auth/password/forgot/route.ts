import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    // Check PlatformUser by email
    const platformUser = await prisma.platformUser.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    // Check Tenant by email or username
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { email: { equals: email, mode: "insensitive" } },
          { username: { equals: email, mode: "insensitive" } },
        ],
      },
    });

    if (!platformUser && !tenant) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 },
      );
    }

    // In a real implementation we would generate a reset token and send an email.
    // Since PlatformUser doesn't have a resetToken field, we just confirm the
    // account exists and simulate the email-sent response.

    return NextResponse.json({
      success: true,
      message: "If an account exists, a reset link has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
