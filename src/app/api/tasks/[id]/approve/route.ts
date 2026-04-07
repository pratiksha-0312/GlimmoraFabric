import { NextRequest, NextResponse } from "next/server";

// POST /api/tasks/:id/approve — approve a task
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return NextResponse.json({
    id,
    status: "Approved",
    approvedBy: "Current User",
    approvedAt: new Date().toISOString(),
  });
}
