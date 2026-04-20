import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

function csvEscape(v: unknown) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const format = (body.format === "json" ? "json" : "csv") as "csv" | "json";

  const where: Prisma.AuditLogWhereInput = {};
  if (body.search && typeof body.search === "string") {
    where.OR = [
      { actor: { contains: body.search, mode: "insensitive" } },
      { entity: { contains: body.search, mode: "insensitive" } },
      { details: { contains: body.search, mode: "insensitive" } },
    ];
  }
  if (body.actor && body.actor !== "All") where.actor = body.actor as string;
  if (body.action && body.action !== "All") where.action = body.action as string;
  if (body.entity && body.entity !== "All") where.entity = body.entity as string;
  if (body.critical) where.isCritical = true;

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { timestamp: "desc" },
  });

  if (format === "json") {
    return new NextResponse(JSON.stringify(logs, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="audit-logs-export.json"`,
      },
    });
  }

  const header = "ID,Timestamp,Actor,Email,Role,Action,Entity,Entity ID,Details,IP,Critical";
  const rows = logs.map((l) =>
    [
      l.id,
      l.timestamp.toISOString(),
      l.actor,
      l.actorEmail,
      l.actorRole,
      l.action,
      l.entity,
      l.entityId,
      l.details,
      l.ip,
      l.isCritical,
    ].map(csvEscape).join(","),
  );
  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="audit-logs-export.csv"`,
    },
  });
}
