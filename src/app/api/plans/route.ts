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

export async function GET() {
  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(plans.map(serialize));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name?.trim() || !body.slug?.trim()) {
    return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
  }

  const exists = await prisma.plan.findUnique({ where: { slug: body.slug } });
  if (exists) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

  const count = await prisma.plan.count();
  const created = await prisma.plan.create({
    data: {
      name: body.name,
      slug: body.slug,
      price: Number(body.price ?? 0),
      billingCycle: body.billingCycle ?? "Monthly",
      currency: body.currency ?? "USD",
      features: JSON.stringify(Array.isArray(body.features) ? body.features : []),
      isActive: body.isActive !== false,
      sortOrder: count + 1,
    },
  });
  return NextResponse.json(serialize(created), { status: 201 });
}
