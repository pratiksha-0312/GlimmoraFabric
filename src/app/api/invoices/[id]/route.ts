import { NextRequest, NextResponse } from "next/server";

// GET /api/invoices/:id — get invoice details (also used for PDF metadata)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const invoice = {
    id,
    number: `INV-${id.slice(-3).toUpperCase()}`,
    date: "2026-04-01",
    dueDate: "2026-04-15",
    status: "Paid",
    tenant: "Glimmora HQ",
    paymentMethod: "Visa •••• 4242",
    billingPeriod: "Apr 1, 2026 – Apr 30, 2026",
    lineItems: [
      { description: "Pro Plan — Monthly", qty: 1, amount: 99 },
    ],
    subtotal: 99,
    tax: 0,
    total: 99,
    currency: "USD",
    paidAt: "2026-04-01T10:30:00Z",
  };

  return NextResponse.json(invoice);
}
