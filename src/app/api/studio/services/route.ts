import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const services = await prisma.studioService.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(services.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    category: s.category,
    description: s.description,
    endpoint: s.endpoint,
    method: s.method,
    version: s.version,
    status: s.status,
    auth: s.auth,
    updatedAt: s.updatedAt.toISOString(),
  })));
}
