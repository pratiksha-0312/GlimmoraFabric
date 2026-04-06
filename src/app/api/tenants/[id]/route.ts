import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatTenant(t: Record<string, unknown>) {
  return {
    id: t.id,
    code: t.code,
    name: t.name,
    username: t.username,
    email: t.email,
    plan: t.plan,
    users: t.users,
    region: t.region,
    domain: t.domain,
    status: t.status,
    apiCalls: t.apiCalls,
    description: t.description,
    password: t.password,
    created: t.createdAt
      ? new Date(t.createdAt as string).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      : "",
  };
}

// GET /api/tenants/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(formatTenant(tenant as unknown as Record<string, unknown>));
}

// PUT /api/tenants/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const tenant = await prisma.tenant.update({ where: { id }, data: body });
  return NextResponse.json(formatTenant(tenant as unknown as Record<string, unknown>));
}

// DELETE /api/tenants/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.tenant.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
