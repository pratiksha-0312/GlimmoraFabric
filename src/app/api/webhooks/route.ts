import { NextRequest, NextResponse } from "next/server";

const SAMPLE_WEBHOOKS = [
  { id: "wh-001", name: "Slack Notifications", url: "https://hooks.slack.com/services/T0123/B4567/abc123xyz", events: ["user.created", "payment.completed"], status: "active", createdAt: "2026-03-15T00:00:00Z" },
  { id: "wh-002", name: "CRM Sync", url: "https://api.salesforce.com/webhooks/glimmora", events: ["user.created", "user.updated"], status: "active", createdAt: "2026-03-20T00:00:00Z" },
];

export async function GET() {
  return NextResponse.json(SAMPLE_WEBHOOKS);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const webhook = { id: `wh-${Date.now()}`, ...body, createdAt: new Date().toISOString() };
  return NextResponse.json(webhook, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json({ ...body, updatedAt: new Date().toISOString() });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  return NextResponse.json({ deleted: true, id });
}
