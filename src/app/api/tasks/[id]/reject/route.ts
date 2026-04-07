import { NextRequest, NextResponse } from "next/server";

// POST /api/tasks/:id/reject — reject a task
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  return NextResponse.json({
    id,
    status: "Rejected",
    rejectedBy: "Current User",
    rejectedAt: new Date().toISOString(),
    reason: body.reason ?? "",
  });
}
