import { NextRequest, NextResponse } from "next/server";

export interface FileRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  thumbnailUrl: string | null;
}

// Mock file records
const files: FileRecord[] = [
  { id: "file_001", name: "Q1-Revenue-Report.pdf", type: "document", size: 2_450_000, mimeType: "application/pdf", uploadedBy: "Finance Bot", uploadedAt: "2026-04-06T10:30:00Z", thumbnailUrl: null },
  { id: "file_002", name: "product-hero.png", type: "image", size: 1_200_000, mimeType: "image/png", uploadedBy: "Design Team", uploadedAt: "2026-04-05T14:00:00Z", thumbnailUrl: "/api/files/file_002/thumbnail" },
  { id: "file_003", name: "team-photo.jpg", type: "image", size: 3_800_000, mimeType: "image/jpeg", uploadedBy: "HR Admin", uploadedAt: "2026-04-05T09:15:00Z", thumbnailUrl: "/api/files/file_003/thumbnail" },
  { id: "file_004", name: "architecture-diagram.png", type: "image", size: 980_000, mimeType: "image/png", uploadedBy: "Platform Lead", uploadedAt: "2026-04-04T16:45:00Z", thumbnailUrl: "/api/files/file_004/thumbnail" },
  { id: "file_005", name: "onboarding-checklist.xlsx", type: "document", size: 450_000, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", uploadedBy: "HR Admin", uploadedAt: "2026-04-04T11:00:00Z", thumbnailUrl: null },
  { id: "file_006", name: "dashboard-mockup.png", type: "image", size: 2_100_000, mimeType: "image/png", uploadedBy: "Design Team", uploadedAt: "2026-04-03T13:20:00Z", thumbnailUrl: "/api/files/file_006/thumbnail" },
  { id: "file_007", name: "logo-dark.svg", type: "image", size: 24_000, mimeType: "image/svg+xml", uploadedBy: "Design Team", uploadedAt: "2026-04-03T10:00:00Z", thumbnailUrl: "/api/files/file_007/thumbnail" },
  { id: "file_008", name: "invoice-INV-2026-008.pdf", type: "document", size: 180_000, mimeType: "application/pdf", uploadedBy: "Finance Bot", uploadedAt: "2026-04-02T15:30:00Z", thumbnailUrl: null },
  { id: "file_009", name: "banner-campaign.jpg", type: "image", size: 4_500_000, mimeType: "image/jpeg", uploadedBy: "Marketing", uploadedAt: "2026-04-02T09:00:00Z", thumbnailUrl: "/api/files/file_009/thumbnail" },
  { id: "file_010", name: "api-spec.yaml", type: "document", size: 85_000, mimeType: "text/yaml", uploadedBy: "Platform Lead", uploadedAt: "2026-04-01T17:00:00Z", thumbnailUrl: null },
  { id: "file_011", name: "user-avatar-default.png", type: "image", size: 45_000, mimeType: "image/png", uploadedBy: "System", uploadedAt: "2026-04-01T08:00:00Z", thumbnailUrl: "/api/files/file_011/thumbnail" },
  { id: "file_012", name: "workflow-screenshot.png", type: "image", size: 1_650_000, mimeType: "image/png", uploadedBy: "QA Engineer", uploadedAt: "2026-03-31T14:00:00Z", thumbnailUrl: "/api/files/file_012/thumbnail" },
];

// GET /api/files — list all files
export async function GET() {
  return NextResponse.json(files);
}

// DELETE /api/files?id=file_001 — delete a file
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing file id" }, { status: 400 });

  const idx = files.findIndex((f) => f.id === id);
  if (idx === -1) return NextResponse.json({ error: "File not found" }, { status: 404 });

  files.splice(idx, 1);
  return NextResponse.json({ success: true });
}
