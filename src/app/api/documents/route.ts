import { NextResponse } from "next/server";

const SAMPLE_DOCUMENTS = [
  { id: "doc-001", name: "Invoice #INV-2026-0142", templateName: "Invoice Template", tenant: "Acme Corp", status: "signed", format: "pdf", size: "245 KB", createdBy: "Vanshika Keswani", createdAt: "2026-04-07T14:30:00Z", signedAt: "2026-04-07T16:00:00Z", signedBy: "John Smith" },
  { id: "doc-002", name: "NDA - Project Alpha", templateName: "NDA Agreement", tenant: "TechStart Inc", status: "pending_sign", format: "pdf", size: "180 KB", createdBy: "Pratiksha M.", createdAt: "2026-04-06T10:15:00Z", signedAt: null, signedBy: null },
  { id: "doc-003", name: "Training Certificate - React Advanced", templateName: "Certificate of Completion", tenant: "DevHub", status: "generated", format: "pdf", size: "120 KB", createdBy: "Vanshika Keswani", createdAt: "2026-04-05T16:45:00Z", signedAt: null, signedBy: null },
  { id: "doc-004", name: "Service Agreement - Q2 2026", templateName: "Service Contract", tenant: "Acme Corp", status: "signed", format: "pdf", size: "310 KB", createdBy: "Pratiksha M.", createdAt: "2026-04-04T09:00:00Z", signedAt: "2026-04-04T15:30:00Z", signedBy: "Jane Doe" },
  { id: "doc-005", name: "Receipt #RCP-8834", templateName: "Receipt Template", tenant: "CloudNine", status: "generated", format: "pdf", size: "95 KB", createdBy: "Vanshika Keswani", createdAt: "2026-04-03T11:20:00Z", signedAt: null, signedBy: null },
  { id: "doc-006", name: "NDA - Partnership Deal", templateName: "NDA Agreement", tenant: "StartupXYZ", status: "expired", format: "pdf", size: "175 KB", createdBy: "Pratiksha M.", createdAt: "2026-03-15T08:00:00Z", signedAt: null, signedBy: null },
  { id: "doc-007", name: "Invoice #INV-2026-0098", templateName: "Invoice Template", tenant: "DevHub", status: "signed", format: "pdf", size: "250 KB", createdBy: "Vanshika Keswani", createdAt: "2026-03-28T17:45:00Z", signedAt: "2026-03-29T09:00:00Z", signedBy: "Alex Kumar" },
  { id: "doc-008", name: "Employment Offer - Senior Dev", templateName: "Employment Offer Letter", tenant: "TechStart Inc", status: "pending_sign", format: "pdf", size: "200 KB", createdBy: "Pratiksha M.", createdAt: "2026-04-08T10:00:00Z", signedAt: null, signedBy: null },
  { id: "doc-009", name: "Monthly Report - March 2026", templateName: "Monthly Report", tenant: "Acme Corp", status: "generated", format: "pdf", size: "450 KB", createdBy: "Vanshika Keswani", createdAt: "2026-04-01T12:00:00Z", signedAt: null, signedBy: null },
  { id: "doc-010", name: "Service Contract - Annual", templateName: "Service Contract", tenant: "CloudNine", status: "pending_sign", format: "pdf", size: "280 KB", createdBy: "Pratiksha M.", createdAt: "2026-04-09T08:00:00Z", signedAt: null, signedBy: null },
];

export async function GET() {
  return NextResponse.json(SAMPLE_DOCUMENTS);
}
