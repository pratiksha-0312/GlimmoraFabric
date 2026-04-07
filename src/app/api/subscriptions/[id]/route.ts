import { NextRequest, NextResponse } from "next/server";

// GET /api/subscriptions/:id — get subscription details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const subscription = {
    id,
    planId: "p2",
    planName: "Pro",
    price: 99,
    currency: "USD",
    billingCycle: "Monthly",
    status: "active",
    currentPeriodStart: "2026-03-07",
    currentPeriodEnd: "2026-04-07",
    cancelAtPeriodEnd: false,
    createdAt: "2025-12-10",
    features: [
      "Up to 25 users",
      "Advanced AI Platform",
      "Unlimited Workflows",
      "50 GB Document Storage",
      "API Access",
      "Priority Support",
    ],
  };

  return NextResponse.json(subscription);
}

// PUT /api/subscriptions/:id — upgrade/downgrade subscription
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const updated = {
    id,
    planId: body.planId,
    planName: body.planName,
    price: body.price,
    currency: "USD",
    billingCycle: body.billingCycle ?? "Monthly",
    status: "active",
    currentPeriodStart: "2026-04-07",
    currentPeriodEnd: "2026-05-07",
    cancelAtPeriodEnd: false,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(updated);
}
