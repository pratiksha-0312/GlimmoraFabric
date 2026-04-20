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

export async function GET() {
  const flags = await prisma.featureFlag.findMany({
    include: { overrides: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(flags.map(serialize));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.key?.trim() || !body.name?.trim()) {
    return NextResponse.json({ error: "key and name are required" }, { status: 400 });
  }

  const exists = await prisma.featureFlag.findUnique({ where: { key: body.key } });
  if (exists) return NextResponse.json({ error: "Flag key already exists" }, { status: 409 });

  const created = await prisma.featureFlag.create({
    data: {
      key: body.key,
      name: body.name,
      description: body.description ?? "",
      enabled: Boolean(body.enabled),
      rolloutPercentage: Math.max(0, Math.min(100, Number(body.rolloutPercentage ?? 0))),
      environment: body.environment ?? "Production",
      category: body.category ?? "Feature",
    },
    include: { overrides: true },
  });

  return NextResponse.json(serialize(created), { status: 201 });
}
