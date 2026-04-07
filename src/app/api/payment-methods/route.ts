import { NextRequest, NextResponse } from "next/server";

const paymentMethods = [
  { id: "pm_1", brand: "Visa", last4: "4242", expMonth: 12, expYear: 2027, holderName: "John Doe", isDefault: true, createdAt: "2025-12-10" },
  { id: "pm_2", brand: "Mastercard", last4: "8888", expMonth: 6, expYear: 2028, holderName: "John Doe", isDefault: false, createdAt: "2026-01-15" },
];

// GET /api/payment-methods — list payment methods
export async function GET() {
  return NextResponse.json(paymentMethods);
}

// POST /api/payment-methods — add a new payment method
export async function POST(req: NextRequest) {
  const body = await req.json();

  const newMethod = {
    id: `pm_${Date.now()}`,
    brand: body.brand ?? "Visa",
    last4: body.cardNumber?.slice(-4) ?? "0000",
    expMonth: parseInt(body.expiry?.split("/")[0] ?? "12"),
    expYear: 2000 + parseInt(body.expiry?.split("/")[1] ?? "28"),
    holderName: body.holderName ?? "",
    isDefault: paymentMethods.length === 0,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(newMethod, { status: 201 });
}

// DELETE /api/payment-methods — delete a payment method (via query param ?id=pm_xxx)
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  return NextResponse.json({ id, deleted: true });
}
