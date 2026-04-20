import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function serialize(flag: {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  environment: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  overrides: { tenantCode: string; tenantName: string; enabled: boolean }[];
}) {
  return {
    id: flag.id,
    key: flag.key,
    name: flag.name,
    description: flag.description,
    enabled: flag.enabled,
    rolloutPercentage: flag.rolloutPercentage,
    environment: flag.environment,
    category: flag.category,
    created: formatDate(flag.createdAt),
    updatedAt: formatDate(flag.updatedAt),
    tenantOverrides: flag.overrides.map((o) => ({
      tenantCode: o.tenantCode,
      tenantName: o.tenantName,
      enabled: o.enabled,
    })),
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const flag = await prisma.featureFlag.findUnique({
    where: { id },
    include: { overrides: true },
  });
  if (!flag) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serialize(flag));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.featureFlag.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.featureFlag.update({
    where: { id },
    data: {
      ...(body.key !== undefined && { key: body.key }),
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.enabled !== undefined && { enabled: Boolean(body.enabled) }),
      ...(body.rolloutPercentage !== undefined && {
        rolloutPercentage: Math.max(0, Math.min(100, Number(body.rolloutPercentage))),
      }),
      ...(body.environment !== undefined && { environment: body.environment }),
      ...(body.category !== undefined && { category: body.category }),
    },
    include: { overrides: true },
  });

  return NextResponse.json(serialize(updated));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.featureFlag.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
