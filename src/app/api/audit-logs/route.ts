import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

function serialize(log: {
  id: string;
  timestamp: Date;
  actor: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ip: string;
  userAgent: string;
  sessionId: string;
  isCritical: boolean;
  beforeJson: string;
  afterJson: string;
}) {
  const parseOrNull = (raw: string) => {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  };
  return {
    id: log.id,
    timestamp: log.timestamp.toISOString().slice(0, 19).replace("T", " "),
    actor: log.actor,
    actorEmail: log.actorEmail,
    actorRole: log.actorRole,
    action: log.action,
    entity: log.entity,
    entityId: log.entityId,
    details: log.details,
    ip: log.ip,
    userAgent: log.userAgent,
    sessionId: log.sessionId,
    isCritical: log.isCritical,
    before: parseOrNull(log.beforeJson),
    after: parseOrNull(log.afterJson),
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const actor = searchParams.get("actor") ?? "";
  const action = searchParams.get("action") ?? "";
  const entity = searchParams.get("entity") ?? "";
  const critical = searchParams.get("critical") === "true";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Prisma.AuditLogWhereInput = {};
  if (search) {
    where.OR = [
      { actor: { contains: search, mode: "insensitive" } },
      { entity: { contains: search, mode: "insensitive" } },
      { details: { contains: search, mode: "insensitive" } },
      { entityId: { contains: search, mode: "insensitive" } },
      { actorEmail: { contains: search, mode: "insensitive" } },
    ];
  }
  if (actor && actor !== "All") where.actor = actor;
  if (action && action !== "All") where.action = action;
  if (entity && entity !== "All") where.entity = entity;
  if (critical) where.isCritical = true;
  if (from || to) {
    where.timestamp = {};
    if (from) where.timestamp.gte = new Date(from);
    if (to) where.timestamp.lte = new Date(to);
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { timestamp: "desc" },
  });

  return NextResponse.json(logs.map(serialize));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await prisma.auditLog.create({
    data: {
      actor: body.actor ?? "",
      actorEmail: body.actorEmail ?? "",
      actorRole: body.actorRole ?? "",
      action: body.action ?? "Accessed",
      entity: body.entity ?? "",
      entityId: body.entityId ?? "",
      details: body.details ?? "",
      ip: body.ip ?? "",
      userAgent: body.userAgent ?? "",
      sessionId: body.sessionId ?? "",
      isCritical: Boolean(body.isCritical),
      beforeJson: body.before ? JSON.stringify(body.before) : "",
      afterJson: body.after ? JSON.stringify(body.after) : "",
    },
  });
  return NextResponse.json(serialize(created), { status: 201 });
}
