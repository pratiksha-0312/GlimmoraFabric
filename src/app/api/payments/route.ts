import { NextRequest, NextResponse } from "next/server";

// In-memory store for demo purposes
const payments: Record<string, Record<string, unknown>> = {};

// POST /api/payments — create a new payment
export async function POST(req: NextRequest) {
  const body = await req.json();

  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const payment = {
    id: paymentId,
    planId: body.planId,
    planName: body.planName,
    amount: body.amount,
    currency: body.currency ?? "USD",
    billing: body.billing,
    paymentMethod: body.paymentMethod ?? "card",
    status: "succeeded",
    requires3ds: false,
    createdAt: new Date().toISOString(),
    receiptUrl: `/checkout/success?paymentId=${paymentId}`,
  };

  // Simulate 3DS requirement for amounts >= $200
  if (body.amount >= 200) {
    payment.status = "requires_action";
    payment.requires3ds = true;
  }

  payments[paymentId] = payment;

  return NextResponse.json(payment, { status: 201 });
}
