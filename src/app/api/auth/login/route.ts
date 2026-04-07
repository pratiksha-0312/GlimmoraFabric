import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SUPER_ADMIN = {
  email: process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ?? "superadmin@glimmora.com",
  password: process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD ?? "SuperAdmin@123",
  fullName: process.env.NEXT_PUBLIC_SUPER_ADMIN_FULL_NAME ?? "Super Admin",
  role: process.env.NEXT_PUBLIC_SUPER_ADMIN_ROLE ?? "super_admin",
};

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // 1. Check super admin credentials
  if (email.toLowerCase() === SUPER_ADMIN.email.toLowerCase()) {
    if (password !== SUPER_ADMIN.password) {
      return NextResponse.json(
        { error: "Incorrect password", description: "The password you entered is incorrect. Please try again or reset your password." },
        { status: 401 },
      );
    }
    return NextResponse.json({
      fullName: SUPER_ADMIN.fullName,
      email: SUPER_ADMIN.email,
      role: SUPER_ADMIN.role,
    });
  }

  // 2. Check platform user credentials (billing_admin, developer, tenant_member, etc.)
  const platformUser = await prisma.platformUser.findFirst({
    where: {
      OR: [
        { email: { equals: email, mode: "insensitive" } },
        { name: { equals: email, mode: "insensitive" } },
      ],
    },
  });

  if (platformUser) {
    if (platformUser.status !== "Active") {
      return NextResponse.json(
        { error: "Account inactive", description: "Your account is not active. Please contact your administrator." },
        { status: 403 },
      );
    }
    if (!platformUser.password || platformUser.password !== password) {
      return NextResponse.json(
        { error: "Incorrect password", description: "The password you entered is incorrect. Please try again or reset your password." },
        { status: 401 },
      );
    }
    return NextResponse.json({
      fullName: platformUser.name,
      email: platformUser.email,
      role: platformUser.role,
      tenantId: platformUser.tenantId ?? undefined,
    });
  }

  // 3. Check tenant credentials (match by username or email)
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [
        { username: { equals: email, mode: "insensitive" } },
        { email: { equals: email, mode: "insensitive" } },
        { name: { equals: email, mode: "insensitive" } },
      ],
    },
  });

  if (!tenant) {
    return NextResponse.json(
      { error: "Account not found", description: "The username you entered doesn\u2019t match any account. Please check and try again." },
      { status: 404 },
    );
  }

  if (tenant.password !== password) {
    return NextResponse.json(
      { error: "Incorrect password", description: "The password you entered is incorrect. Please try again or reset your password." },
      { status: 401 },
    );
  }

  return NextResponse.json({
    fullName: tenant.name,
    email: tenant.email || tenant.username,
    role: "tenant_admin" as const,
    tenantId: tenant.id,
  });
}
