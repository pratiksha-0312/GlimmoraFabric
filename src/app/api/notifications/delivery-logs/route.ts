import { NextResponse } from "next/server";

const SAMPLE_LOGS = [
  { id: "dl-001", templateName: "Welcome Email", channel: "email", recipient: "rahul.sharma@acme.com", status: "delivered", sentAt: "2026-04-07T14:32:10Z", deliveredAt: "2026-04-07T14:32:12Z" },
  { id: "dl-002", templateName: "Password Reset", channel: "email", recipient: "priya@diamondcorp.com", status: "delivered", sentAt: "2026-04-07T14:28:05Z", deliveredAt: "2026-04-07T14:28:08Z" },
  { id: "dl-003", templateName: "Two-Factor Code", channel: "sms", recipient: "+91 98765 43210", status: "delivered", sentAt: "2026-04-07T14:15:00Z", deliveredAt: "2026-04-07T14:15:03Z" },
];

export async function GET() {
  return NextResponse.json(SAMPLE_LOGS);
}
