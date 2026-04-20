import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serialize(p: {
  id: string;
  name: string;
  slug: string;
  price: number;
  billingCycle: string;
  currency: string;
  features: string;
  isActive: boolean;
}) {
  let features: string[] = [];
  try { features = JSON.parse(p.features || "[]"); } catch { features = []; }
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    billingCycle: p.billingCycle,
    currency: p.currency,
    features,
    isActive: p.isActive,
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serialize(plan));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.plan.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.plan.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.price !== undefined && { price: Number(body.price) }),
      ...(body.billingCycle !== undefined && { billingCycle: body.billingCycle }),
      ...(body.currency !== undefined && { currency: body.currency }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      ...(Array.isArray(body.features) && { features: JSON.stringify(body.features) }),
    },
  });

  return NextResponse.json(serialize(updated));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.plan.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
