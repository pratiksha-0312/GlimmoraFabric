import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/studio/sandbox — executes a playground request.
// Body: { serviceId, method, endpoint, headers, body }
// In a real implementation we'd proxy the request against a sandbox gateway;
// here we synthesise a representative response using the stored sample, so
// the playground feels real without exposing production endpoints.
export async function POST(req: NextRequest) {
  const started = Date.now();
  const body = await req.json().catch(() => ({} as Record<string, unknown>));

  const serviceId = typeof body.serviceId === "string" ? body.serviceId : null;
  const method = (typeof body.method === "string" ? body.method : "GET").toUpperCase();
  const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
  const reqBody = body.body ?? null;

  let sampleResponse = "";
  if (serviceId) {
    const service = await prisma.studioService.findFirst({
      where: { OR: [{ id: serviceId }, { slug: serviceId }] },
      select: { sampleResponse: true },
    });
    sampleResponse = service?.sampleResponse ?? "";
  }

  let parsed: unknown = null;
  if (sampleResponse) {
    try { parsed = JSON.parse(sampleResponse); } catch { parsed = sampleResponse; }
  }

  return NextResponse.json({
    request: { method, endpoint, body: reqBody },
    response: {
      status: 200,
      statusText: "OK",
      body: parsed ?? { ok: true, message: "Sandbox response", echoed: reqBody },
    },
    latencyMs: Date.now() - started + Math.floor(30 + Math.random() * 120),
    executedAt: new Date().toISOString(),
  });
}
