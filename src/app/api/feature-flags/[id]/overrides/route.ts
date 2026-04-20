import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type OverrideInput = {
  tenantCode: string;
  tenantName?: string;
  enabled: boolean;
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const overrides = await prisma.featureFlagOverride.findMany({
    where: { flagId: id },
    orderBy: { tenantCode: "asc" },
  });
  return NextResponse.json(overrides.map((o) => ({
    tenantCode: o.tenantCode,
    tenantName: o.tenantName,
    enabled: o.enabled,
  })));
}

// Full-replace semantics: body { overrides: [{ tenantCode, tenantName, enabled }] }
// wipes the existing override set for this flag and writes the new set.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const overrides = Array.isArray(body.overrides) ? (body.overrides as OverrideInput[]) : [];

  const flag = await prisma.featureFlag.findUnique({ where: { id } });
  if (!flag) return NextResponse.json({ error: "Flag not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.featureFlagOverride.deleteMany({ where: { flagId: id } }),
    ...overrides
      .filter((o) => typeof o?.tenantCode === "string" && o.tenantCode.trim())
      .map((o) =>
        prisma.featureFlagOverride.create({
          data: {
            flagId: id,
            tenantCode: o.tenantCode,
            tenantName: o.tenantName ?? "",
            enabled: Boolean(o.enabled),
          },
        }),
      ),
  ]);

  const refreshed = await prisma.featureFlagOverride.findMany({
    where: { flagId: id },
    orderBy: { tenantCode: "asc" },
  });

  return NextResponse.json(refreshed.map((o) => ({
    tenantCode: o.tenantCode,
    tenantName: o.tenantName,
    enabled: o.enabled,
  })));
}
