import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const components = await prisma.studioComponent.findMany({ orderBy: { downloads: "desc" } });
  return NextResponse.json(components);
}
