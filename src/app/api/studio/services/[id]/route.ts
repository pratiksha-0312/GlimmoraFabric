import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Accept either cuid id or slug, so clients can deep-link by slug.
  const service = await prisma.studioService.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  return NextResponse.json({
    id: service.id,
    slug: service.slug,
    name: service.name,
    category: service.category,
    description: service.description,
    endpoint: service.endpoint,
    method: service.method,
    version: service.version,
    status: service.status,
    auth: service.auth,
    docsMarkdown: service.docsMarkdown,
    sampleRequest: service.sampleRequest,
    sampleResponse: service.sampleResponse,
    updatedAt: service.updatedAt.toISOString(),
  });
}
