import { NextRequest, NextResponse } from "next/server";

// POST /api/subscriptions/:id/cancel — cancel subscription
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const result = {
    id,
    status: "cancelled",
    cancelAtPeriodEnd: true,
    cancellationReason: body.reason ?? "other",
    cancellationFeedback: body.feedback ?? "",
    cancelledAt: new Date().toISOString(),
    effectiveDate: "2026-04-07",
  };

  return NextResponse.json(result);
}
