import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const result = {
      documentId: id,
      signatureId: `sig-${Date.now()}`,
      signerName: body.signerName,
      signerEmail: body.signerEmail,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
