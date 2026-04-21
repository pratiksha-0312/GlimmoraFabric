import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const starters = await prisma.studioStarter.findMany({ orderBy: { stars: "desc" } });
  return NextResponse.json(starters);
}
