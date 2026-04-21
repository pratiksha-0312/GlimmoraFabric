import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const events = await prisma.studioEvent.findMany({ orderBy: [{ category: "asc" }, { key: "asc" }] });
  return NextResponse.json(events.map((e) => {
    let schema: unknown = {};
    try { schema = JSON.parse(e.schemaJson || "{}"); } catch { schema = {}; }
    return {
      id: e.id,
      key: e.key,
      name: e.name,
      category: e.category,
      description: e.description,
      version: e.version,
      schema,
      updatedAt: e.updatedAt.toISOString(),
    };
  }));
}
