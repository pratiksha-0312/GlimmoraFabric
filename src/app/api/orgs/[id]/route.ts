import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/orgs/:id — get org (tenant) details
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: tenant.id,
    name: tenant.name,
    domain: tenant.domain,
    description: tenant.description,
    plan: tenant.plan,
    status: tenant.status,
  });
}

// PUT /api/orgs/:id — update org details
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const tenant = await prisma.tenant.update({
    where: { id },
    data: {
      name: body.name,
      domain: body.domain,
      description: body.description,
    },
  });
  return NextResponse.json({
    id: tenant.id,
    name: tenant.name,
    domain: tenant.domain,
    description: tenant.description,
    plan: tenant.plan,
    status: tenant.status,
  });
}
