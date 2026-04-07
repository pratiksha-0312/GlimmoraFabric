import { NextRequest, NextResponse } from "next/server";

// GET /api/payments/:id — get payment details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Return mock payment data for any id
  const payment = {
    id,
    planName: "Pro",
    amount: 99,
    currency: "USD",
    status: "succeeded",
    paymentMethod: "card",
    cardLast4: "4242",
    cardBrand: "Visa",
    billing: {
      fullName: "John Doe",
      email: "john@example.com",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "US",
    },
    createdAt: new Date().toISOString(),
    receiptNumber: `RCT-${id.slice(-6).toUpperCase()}`,
  };

  return NextResponse.json(payment);
}
