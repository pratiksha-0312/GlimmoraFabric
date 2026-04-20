import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const log = await prisma.auditLog.findUnique({ where: { id } });
  if (!log) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serialize(log));
}
