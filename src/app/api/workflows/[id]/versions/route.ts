import { NextRequest, NextResponse } from "next/server";

// GET /api/workflows/:id/versions — get version history
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const versions = [
    { version: 3, status: "Published", changedBy: "Admin", changedAt: "2026-03-28", summary: "Added approval timeout step" },
    { version: 2, status: "Published", changedBy: "Admin", changedAt: "2026-02-20", summary: "Updated decision node conditions" },
    { version: 1, status: "Draft", changedBy: "Admin", changedAt: "2026-02-15", summary: "Initial workflow creation" },
  ];

  return NextResponse.json({ workflowId: id, versions });
}
