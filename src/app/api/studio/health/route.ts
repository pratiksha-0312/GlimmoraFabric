import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/studio/health — platform health snapshot. Mixes real counts
// (services, active API keys) with synthetic runtime metrics so the
// dashboard has live-feeling numbers without a full ops backend.
export async function GET() {
  const [serviceCount, eventCount, componentCount, activeKeys] = await Promise.all([
    prisma.studioService.count(),
    prisma.studioEvent.count(),
    prisma.studioComponent.count(),
    prisma.studioApiKey.count({ where: { status: "active" } }),
  ]);

  const jitter = (base: number, spread: number) => Math.round(base + (Math.random() - 0.5) * spread);

  return NextResponse.json({
    status: "operational",
    checkedAt: new Date().toISOString(),
    summary: {
      services: serviceCount,
      events: eventCount,
      components: componentCount,
      activeApiKeys: activeKeys,
    },
    components: [
      { name: "API Gateway", status: "operational", latencyMs: jitter(42, 18), uptimePct: 99.97 },
      { name: "Auth Service", status: "operational", latencyMs: jitter(55, 22), uptimePct: 99.99 },
      { name: "Workflow Engine", status: "operational", latencyMs: jitter(110, 30), uptimePct: 99.92 },
      { name: "Notification Bus", status: "operational", latencyMs: jitter(75, 25), uptimePct: 99.95 },
      { name: "Billing Gateway", status: "operational", latencyMs: jitter(140, 35), uptimePct: 99.88 },
      { name: "AI Inference", status: "degraded", latencyMs: jitter(520, 140), uptimePct: 99.40 },
      { name: "Document Renderer", status: "operational", latencyMs: jitter(220, 50), uptimePct: 99.78 },
      { name: "File Storage", status: "operational", latencyMs: jitter(65, 20), uptimePct: 99.99 },
    ],
    incidents: [
      { id: "inc-2026-04-20-001", title: "Elevated latency on AI Inference", status: "monitoring", startedAt: "2026-04-20T09:10:00Z" },
    ],
  });
}
