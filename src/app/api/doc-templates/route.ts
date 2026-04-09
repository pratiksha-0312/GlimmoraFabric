import { NextRequest, NextResponse } from "next/server";

const SAMPLE_TEMPLATES = [
  { id: "dt-001", name: "Invoice Template", description: "Standard invoice for all tenants", type: "invoice", format: "html", status: "published", version: 3, createdBy: "Vanshika Keswani", updatedBy: "Vanshika Keswani", createdAt: "2026-03-15T10:00:00Z", updatedAt: "2026-04-07T14:30:00Z", usageCount: 1245, content: "<h1>Invoice #{{invoice_id}}</h1><p>Date: {{date}}</p><p>Tenant: {{tenant_name}}</p><table><tr><th>Item</th><th>Amount</th></tr>{{#items}}<tr><td>{{name}}</td><td>{{amount}}</td></tr>{{/items}}</table><p><strong>Total: {{total}}</strong></p>" },
  { id: "dt-002", name: "NDA Agreement", description: "Non-disclosure agreement template", type: "legal", format: "html", status: "published", version: 5, createdBy: "Vanshika Keswani", updatedBy: "Pratiksha M.", createdAt: "2026-02-10T09:00:00Z", updatedAt: "2026-04-05T16:45:00Z", usageCount: 890, content: "<h1>Non-Disclosure Agreement</h1><p>This NDA is entered into by {{party_a}} and {{party_b}} on {{effective_date}}.</p><h2>1. Definition of Confidential Information</h2><p>{{confidential_info_definition}}</p><h2>2. Obligations</h2><p>The receiving party agrees to...</p>" },
  { id: "dt-003", name: "Certificate of Completion", description: "Training completion certificate", type: "certificate", format: "html", status: "published", version: 2, createdBy: "Pratiksha M.", updatedBy: "Pratiksha M.", createdAt: "2026-03-01T11:00:00Z", updatedAt: "2026-04-03T11:20:00Z", usageCount: 3420, content: "<div style='text-align:center'><h1>Certificate of Completion</h1><p>This certifies that</p><h2>{{recipient_name}}</h2><p>has successfully completed</p><h3>{{course_name}}</h3><p>on {{completion_date}}</p></div>" },
  { id: "dt-004", name: "Service Contract", description: "Standard service agreement", type: "contract", format: "html", status: "published", version: 4, createdBy: "Vanshika Keswani", updatedBy: "Vanshika Keswani", createdAt: "2026-01-20T08:00:00Z", updatedAt: "2026-04-01T08:10:00Z", usageCount: 670, content: "<h1>Service Contract</h1><p>Between {{provider}} and {{client}}</p><h2>Scope of Services</h2><p>{{scope}}</p><h2>Terms</h2><p>Duration: {{duration}}</p><p>Fee: {{fee}}</p>" },
  { id: "dt-005", name: "Receipt Template", description: "Payment receipt for transactions", type: "receipt", format: "html", status: "published", version: 1, createdBy: "Pratiksha M.", updatedBy: "Pratiksha M.", createdAt: "2026-03-25T14:00:00Z", updatedAt: "2026-03-25T14:00:00Z", usageCount: 5200, content: "<h1>Payment Receipt</h1><p>Receipt #: {{receipt_id}}</p><p>Date: {{date}}</p><p>From: {{payer}}</p><p>Amount: {{amount}}</p><p>Method: {{method}}</p>" },
  { id: "dt-006", name: "Employment Offer Letter", description: "Job offer letter template", type: "legal", format: "html", status: "draft", version: 1, createdBy: "Vanshika Keswani", updatedBy: "Vanshika Keswani", createdAt: "2026-04-05T10:00:00Z", updatedAt: "2026-04-05T10:00:00Z", usageCount: 0, content: "<h1>Offer of Employment</h1><p>Dear {{candidate_name}},</p><p>We are pleased to offer you the position of {{position}} at {{company}}.</p><p>Start Date: {{start_date}}</p><p>Salary: {{salary}}</p>" },
  { id: "dt-007", name: "Monthly Report", description: "Monthly business report template", type: "report", format: "html", status: "draft", version: 1, createdBy: "Pratiksha M.", updatedBy: "Pratiksha M.", createdAt: "2026-04-08T09:00:00Z", updatedAt: "2026-04-08T09:00:00Z", usageCount: 0, content: "<h1>Monthly Report - {{month}} {{year}}</h1><h2>Summary</h2><p>{{summary}}</p><h2>Key Metrics</h2><p>Revenue: {{revenue}}</p><p>Growth: {{growth}}</p>" },
  { id: "dt-008", name: "Privacy Policy", description: "Standard privacy policy document", type: "legal", format: "html", status: "archived", version: 2, createdBy: "Vanshika Keswani", updatedBy: "Vanshika Keswani", createdAt: "2025-12-01T08:00:00Z", updatedAt: "2026-02-15T10:00:00Z", usageCount: 150, content: "<h1>Privacy Policy</h1><p>Last updated: {{date}}</p><p>{{company}} respects your privacy...</p>" },
];

export async function GET() {
  return NextResponse.json(SAMPLE_TEMPLATES);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newTemplate = {
      id: `dt-${Date.now()}`,
      ...body,
      version: 1,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
