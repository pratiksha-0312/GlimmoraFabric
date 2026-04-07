import { NextRequest, NextResponse } from "next/server";

// POST /api/workflow-instances/:id/cancel — cancel a running instance
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return NextResponse.json({
    id,
    status: "Cancelled",
    cancelledAt: new Date().toISOString(),
    cancelledBy: "Current User",
  });
}
