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

// GET /api/tenants — list all tenants
export async function GET() {
  const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(tenants.map(formatTenant));
}

// POST /api/tenants — create a new tenant
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Auto-generate tenant code if not provided
  let code = body.code ?? "";
  if (!code) {
    const all = await prisma.tenant.findMany({ select: { code: true } });
    let maxNum = 0;
    for (const t of all) {
      const m = (t.code ?? "").match(/^TENT(\d+)$/);
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    }
    code = `TENT${String(maxNum + 1).padStart(3, "0")}`;
  }

  const tenant = await prisma.tenant.create({
    data: {
      code,
      name: body.name,
      username: body.username ?? "",
      email: body.email ?? "",
      plan: body.plan ?? "Starter",
      users: body.users ?? 0,
      region: body.region ?? "US-East",
      domain: body.domain ?? "",
      status: body.status ?? "Provisioning",
      apiCalls: body.apiCalls ?? "—",
      description: body.description ?? "",
      password: body.password ?? "",
    },
  });
  return NextResponse.json(formatTenant(tenant as unknown as Record<string, unknown>), { status: 201 });
}
