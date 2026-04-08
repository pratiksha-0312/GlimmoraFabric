import { NextResponse } from "next/server";

const SAMPLE_TEMPLATES = [
  { id: "tpl-001", name: "Welcome Email", subject: "Welcome to {{tenant_name}}!", channel: "email", category: "onboarding", status: "active", lastEdited: "2026-04-07T14:30:00Z", editedBy: "Vanshika Keswani", version: 3, usageCount: 1245 },
  { id: "tpl-002", name: "Password Reset", subject: "Reset your password", channel: "email", category: "security", status: "active", lastEdited: "2026-04-06T10:15:00Z", editedBy: "Vanshika Keswani", version: 5, usageCount: 890 },
  { id: "tpl-003", name: "Invoice Generated", subject: "Your invoice #{{invoice_id}} is ready", channel: "email", category: "billing", status: "active", lastEdited: "2026-04-05T16:45:00Z", editedBy: "Pratiksha M.", version: 2, usageCount: 3420 },
];

export async function GET() {
  return NextResponse.json(SAMPLE_TEMPLATES);
}
