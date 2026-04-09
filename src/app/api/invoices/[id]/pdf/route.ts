import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Minimal PDF generator — no external dependencies
// Produces a valid PDF 1.4 with invoice content using built-in Helvetica font
// ---------------------------------------------------------------------------

function buildPdf(lines: { text: string; x: number; y: number; size: number; bold?: boolean }[]): Buffer {
  const objects: string[] = [];
  let objectCount = 0;
  const offsets: number[] = [];
  let body = "";

  function addObject(content: string): number {
    objectCount++;
    offsets.push(body.length);
    const obj = `${objectCount} 0 obj\n${content}\nendobj\n`;
    body += obj;
    return objectCount;
  }

  // 1 - Catalog
  addObject("<< /Type /Catalog /Pages 2 0 R >>");

  // 2 - Pages
  addObject("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");

  // Build stream content
  let stream = "";
  for (const line of lines) {
    const fontKey = line.bold ? "/F2" : "/F1";
    const escaped = line.text
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/•/g, ".");
    stream += `BT ${fontKey} ${line.size} Tf ${line.x} ${842 - line.y} Td (${escaped}) Tj ET\n`;
  }

  // 3 - Page
  addObject(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>`
  );

  // 4 - Content stream
  addObject(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);

  // 5 - Font (Helvetica)
  addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  // 6 - Font Bold (Helvetica-Bold)
  addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  // Cross-reference table
  const xrefOffset = body.length;
  let xref = `xref\n0 ${objectCount + 1}\n`;
  xref += "0000000000 65535 f \n";

  const header = "%PDF-1.4\n";
  for (const offset of offsets) {
    const pos = (header.length + offset).toString().padStart(10, "0");
    xref += `${pos} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${header.length + xrefOffset}\n%%EOF`;

  const pdf = header + body + xref + trailer;
  return Buffer.from(pdf, "binary");
}

// GET /api/invoices/:id/pdf
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const inv = {
    number: `INV-${id.slice(-3).toUpperCase()}`,
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    status: "Paid",
    tenant: "Glimmora HQ",
    payment: "Visa .... 4242",
    period: "Apr 1, 2026 - Apr 30, 2026",
    item: "Pro Plan - Monthly",
    qty: 1,
    price: 99,
    tax: 0,
  };

  const total = inv.qty * inv.price + inv.tax;

  const lines: { text: string; x: number; y: number; size: number; bold?: boolean }[] = [
    // Header
    { text: "INVOICE", x: 430, y: 50, size: 24, bold: true },
    { text: `# ${inv.number}`, x: 430, y: 80, size: 10 },
    { text: `Date: ${inv.date}`, x: 430, y: 95, size: 10 },
    { text: `Status: ${inv.status}`, x: 430, y: 110, size: 10 },

    // Company
    { text: "Glimmora Fabric", x: 50, y: 50, size: 18, bold: true },
    { text: "glimmora.io", x: 50, y: 72, size: 9 },

    // Bill To
    { text: "BILL TO", x: 50, y: 120, size: 9 },
    { text: inv.tenant, x: 50, y: 138, size: 12, bold: true },
    { text: `Payment: ${inv.payment}`, x: 50, y: 156, size: 9 },
    { text: `Billing Period: ${inv.period}`, x: 50, y: 170, size: 9 },

    // Table Header
    { text: "DESCRIPTION", x: 50, y: 220, size: 9, bold: true },
    { text: "QTY", x: 350, y: 220, size: 9, bold: true },
    { text: "PRICE", x: 410, y: 220, size: 9, bold: true },
    { text: "AMOUNT", x: 490, y: 220, size: 9, bold: true },

    // Line item
    { text: inv.item, x: 50, y: 248, size: 10 },
    { text: String(inv.qty), x: 358, y: 248, size: 10 },
    { text: `$${inv.price.toFixed(2)}`, x: 410, y: 248, size: 10 },
    { text: `$${(inv.qty * inv.price).toFixed(2)}`, x: 490, y: 248, size: 10 },

    // Totals
    { text: "Subtotal", x: 410, y: 290, size: 10 },
    { text: `$${(inv.qty * inv.price).toFixed(2)}`, x: 490, y: 290, size: 10 },
    { text: "Tax", x: 410, y: 310, size: 10 },
    { text: `$${inv.tax.toFixed(2)}`, x: 490, y: 310, size: 10 },
    { text: "Total", x: 410, y: 340, size: 12, bold: true },
    { text: `$${total.toFixed(2)}`, x: 490, y: 340, size: 12, bold: true },

    // Footer
    { text: "Thank you for your business!", x: 200, y: 750, size: 10 },
    { text: "Glimmora Fabric - glimmora.io", x: 210, y: 768, size: 9 },
  ];

  const pdfBuffer = buildPdf(lines);
  const body = new Uint8Array(pdfBuffer);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${id}.pdf"`,
      "Content-Length": String(pdfBuffer.length),
    },
  });
}
