import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/users/import — bulk import users, skipping duplicate emails
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body.users) || body.users.length === 0) {
      return NextResponse.json(
        { error: "users array is required and must not be empty" },
        { status: 400 },
      );
    }

    const incomingEmails = body.users.map(
      (u: { email: string }) => u.email,
    );

    // Find emails that already exist in the database
    const existingUsers = await prisma.platformUser.findMany({
      where: { email: { in: incomingEmails } },
      select: { email: true },
    });
    const existingEmails = new Set(existingUsers.map((u) => u.email));

    // Filter to only new users
    const newUsers = body.users.filter(
      (u: { email: string }) => !existingEmails.has(u.email),
    );

    const skipped = body.users.length - newUsers.length;

    if (newUsers.length > 0) {
      await prisma.platformUser.createMany({
        data: newUsers.map(
          (u: { name: string; email: string; role?: string; status?: string }) => ({
            name: u.name,
            email: u.email,
            role: u.role ?? "tenant_member",
            status: u.status ?? "Active",
            joinedDate: new Date().toISOString().slice(0, 10),
          }),
        ),
      });
    }

    return NextResponse.json({ imported: newUsers.length, skipped });
  } catch (error) {
    console.error("POST /api/users/import error:", error);
    return NextResponse.json(
      { error: "Failed to import users" },
      { status: 500 },
    );
  }
}
