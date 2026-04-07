import { NextRequest, NextResponse } from "next/server";

// GET /api/invoices/:id/pdf — download invoice as PDF (returns text placeholder)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const content = [
    "========================================",
    "            GLIMMORA INVOICE            ",
    "========================================",
    "",
    `Invoice #: INV-${id.slice(-3).toUpperCase()}`,
    `Date: ${new Date().toLocaleDateString()}`,
    `Status: Paid`,
    "",
    "----------------------------------------",
    "Item                          Amount    ",
    "----------------------------------------",
    "Pro Plan — Monthly            $99.00    ",
    "----------------------------------------",
    "Subtotal                      $99.00    ",
    "Tax                           $0.00     ",
    "Total                         $99.00    ",
    "========================================",
    "",
    "Thank you for your business!",
    "Glimmora Platform — glimmora.io",
  ].join("\n");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${id}.pdf"`,
    },
  });
}
