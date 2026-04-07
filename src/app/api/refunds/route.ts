import { NextRequest, NextResponse } from "next/server";

const refunds = [
  { id: "ref_001", paymentId: "pay_001", tenant: "VerifAI", amount: 99, currency: "USD", reason: "Duplicate charge", status: "Completed", createdAt: "2026-03-28", processedAt: "2026-03-29" },
  { id: "ref_002", paymentId: "pay_002", tenant: "Diamond Corp", amount: 249, currency: "USD", reason: "Service not as described", status: "Completed", createdAt: "2026-03-20", processedAt: "2026-03-22" },
  { id: "ref_003", paymentId: "pay_003", tenant: "Hospitality Co", amount: 29, currency: "USD", reason: "Accidental purchase", status: "Pending", createdAt: "2026-04-02", processedAt: null },
  { id: "ref_004", paymentId: "pay_004", tenant: "Aero Systems", amount: 99, currency: "USD", reason: "Downgrade difference", status: "Completed", createdAt: "2026-03-15", processedAt: "2026-03-16" },
  { id: "ref_005", paymentId: "pay_005", tenant: "Tax Solutions", amount: 249, currency: "USD", reason: "Cancelled within trial", status: "Rejected", createdAt: "2026-03-10", processedAt: "2026-03-12" },
];

// GET /api/refunds — list all refunds
export async function GET() {
  return NextResponse.json(refunds);
}

// POST /api/refunds — create a new refund
export async function POST(req: NextRequest) {
  const body = await req.json();

  const newRefund = {
    id: `ref_${Date.now()}`,
    paymentId: body.paymentId,
    tenant: body.tenant ?? "Unknown",
    amount: body.amount,
    currency: body.currency ?? "USD",
    reason: body.reason ?? "",
    status: "Pending",
    createdAt: new Date().toISOString().slice(0, 10),
    processedAt: null,
  };

  return NextResponse.json(newRefund, { status: 201 });
}
