import { NextRequest, NextResponse } from "next/server";

// GET /api/tenants/:id/usage — get tenant usage metrics
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await params;

  const usage = {
    users: { used: 12, limit: 25, label: "Users" },
    apiCalls: { used: 8420, limit: 50000, label: "API Calls" },
    storage: { used: 18.5, limit: 50, label: "Storage (GB)" },
    workflows: { used: 34, limit: -1, label: "Workflows" },
  };

  return NextResponse.json(usage);
}
