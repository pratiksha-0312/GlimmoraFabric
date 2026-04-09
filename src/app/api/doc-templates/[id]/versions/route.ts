import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const SAMPLE_VERSIONS = [
    { version: 3, changedBy: "Vanshika Keswani", changeDescription: "Updated table layout and styling", date: "2026-04-07T14:30:00Z", status: "current" },
    { version: 2, changedBy: "Pratiksha M.", changeDescription: "Added item line variables", date: "2026-03-20T10:15:00Z", status: "previous" },
    { version: 1, changedBy: "Vanshika Keswani", changeDescription: "Initial template creation", date: "2026-03-15T10:00:00Z", status: "previous" },
  ];

  return NextResponse.json({ templateId: id, versions: SAMPLE_VERSIONS });
}
