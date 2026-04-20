import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RuleUpdate = {
  id: string;
  dataType?: string;
  description?: string;
  retentionDays?: number;
  action?: string;
  enabled?: boolean;
};

export async function GET() {
  const [rules, settings] = await Promise.all([
    prisma.retentionRule.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.retentionSettings.findUnique({ where: { id: "global" } }),
  ]);

  return NextResponse.json({
    rules,
    settings: settings ?? { id: "global", defaultRetention: 365, autoDeleteEnabled: true },
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();

  if (Array.isArray(body.rules)) {
    await Promise.all(
      (body.rules as RuleUpdate[]).map((rule) =>
        prisma.retentionRule.update({
          where: { id: rule.id },
          data: {
            ...(rule.dataType !== undefined && { dataType: rule.dataType }),
            ...(rule.description !== undefined && { description: rule.description }),
            ...(rule.retentionDays !== undefined && { retentionDays: rule.retentionDays }),
            ...(rule.action !== undefined && { action: rule.action }),
            ...(rule.enabled !== undefined && { enabled: rule.enabled }),
          },
        }).catch(() => null),
      ),
    );
  }

  if (body.settings) {
    await prisma.retentionSettings.upsert({
      where: { id: "global" },
      update: {
        defaultRetention: body.settings.defaultRetention ?? 365,
        autoDeleteEnabled: body.settings.autoDeleteEnabled ?? true,
      },
      create: {
        id: "global",
        defaultRetention: body.settings.defaultRetention ?? 365,
        autoDeleteEnabled: body.settings.autoDeleteEnabled ?? true,
      },
    });
  }

  const [rules, settings] = await Promise.all([
    prisma.retentionRule.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.retentionSettings.findUnique({ where: { id: "global" } }),
  ]);
  return NextResponse.json({ rules, settings });
}
