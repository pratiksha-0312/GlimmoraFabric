import { NextRequest, NextResponse } from "next/server";

interface PreviewBody {
  subject?: string;
  body?: string;
  channel?: "email" | "sms" | "push" | "inApp";
  variables?: Record<string, string | number>;
}

function render(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{{${key}}}`
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as PreviewBody;

  const vars: Record<string, string | number> = {
    userName: "Rahul Sharma",
    userEmail: "rahul.sharma@acme.com",
    tenantName: "Acme Corp",
    actionUrl: "https://app.glimmora.com/action/abc123",
    supportEmail: "support@glimmora.com",
    ...(body.variables ?? {}),
  };

  const subject = render(body.subject ?? "", vars);
  const rendered = render(body.body ?? "", vars);

  return NextResponse.json({
    templateId: id,
    channel: body.channel ?? "email",
    subject,
    body: rendered,
    variables: vars,
    previewedAt: new Date().toISOString(),
  });
}
