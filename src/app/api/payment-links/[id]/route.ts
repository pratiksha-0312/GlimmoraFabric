import { NextRequest, NextResponse } from "next/server";

// GET /api/payment-links/:id — get payment link details (public)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Return mock payment link data
  const paymentLink = {
    id,
    planId: "p2",
    planName: "Pro",
    amount: 99,
    currency: "USD",
    billingCycle: "Monthly",
    description: "Pro Plan — Monthly Subscription",
    features: [
      "Up to 25 users",
      "Advanced AI Platform",
      "Unlimited Workflows",
      "50 GB Document Storage",
      "API Access",
      "Priority Support",
    ],
    active: true,
    expiresAt: null,
    createdBy: "Glimmora Platform",
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(paymentLink);
}
