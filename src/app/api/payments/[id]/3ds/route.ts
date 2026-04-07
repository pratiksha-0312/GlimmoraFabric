import { NextRequest, NextResponse } from "next/server";

// POST /api/payments/:id/3ds — handle 3D Secure verification
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Simulate 3DS verification — always succeeds after a delay
  const result = {
    id,
    status: "succeeded",
    threeDSecure: {
      authenticated: true,
      version: "2.0",
      outcome: "authenticated",
    },
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(result);
}
