import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET returns the current feature list; PUT replaces it wholesale.
// Body shape: { features: string[] }
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  let features: string[] = [];
  try { features = JSON.parse(plan.features || "[]"); } catch { features = []; }
  return NextResponse.json({ planId: id, features });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  if (!Array.isArray(body.features)) {
    return NextResponse.json({ error: "features must be an array of strings" }, { status: 400 });
  }

  const existing = await prisma.plan.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const features = (body.features as unknown[])
    .filter((f): f is string => typeof f === "string" && f.trim().length > 0)
    .map((f) => f.trim());

  const updated = await prisma.plan.update({
    where: { id },
    data: { features: JSON.stringify(features) },
  });

  let result: string[] = [];
  try { result = JSON.parse(updated.features); } catch { result = []; }
  return NextResponse.json({ planId: id, features: result });
}
