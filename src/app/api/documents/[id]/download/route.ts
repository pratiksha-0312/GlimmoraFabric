import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // In production, this would fetch the actual document file from storage
  const pdfContent = `%PDF-1.4 mock content for document ${id}`;

  return new NextResponse(pdfContent, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="document-${id}.pdf"`,
    },
  });
}
