-- CreateTable: files
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'document',
    "size" INTEGER NOT NULL DEFAULT 0,
    "mimeType" TEXT NOT NULL DEFAULT '',
    "storagePath" TEXT NOT NULL DEFAULT '',
    "uploadedBy" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- Seed: files (matches the prior hardcoded sample set)
INSERT INTO "files" ("id", "name", "type", "size", "mimeType", "storagePath", "uploadedBy", "thumbnailUrl", "createdAt") VALUES
('file_001', 'Q1-Revenue-Report.pdf', 'document', 2450000, 'application/pdf', '', 'Finance Bot', NULL, '2026-04-06T10:30:00Z'),
('file_002', 'product-hero.png', 'image', 1200000, 'image/png', '', 'Design Team', '/api/files/file_002/thumbnail', '2026-04-05T14:00:00Z'),
('file_003', 'team-photo.jpg', 'image', 3800000, 'image/jpeg', '', 'HR Admin', '/api/files/file_003/thumbnail', '2026-04-05T09:15:00Z'),
('file_004', 'architecture-diagram.png', 'image', 980000, 'image/png', '', 'Platform Lead', '/api/files/file_004/thumbnail', '2026-04-04T16:45:00Z'),
('file_005', 'onboarding-checklist.xlsx', 'document', 450000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '', 'HR Admin', NULL, '2026-04-04T11:00:00Z'),
('file_006', 'dashboard-mockup.png', 'image', 2100000, 'image/png', '', 'Design Team', '/api/files/file_006/thumbnail', '2026-04-03T13:20:00Z'),
('file_007', 'logo-dark.svg', 'image', 24000, 'image/svg+xml', '', 'Design Team', '/api/files/file_007/thumbnail', '2026-04-03T10:00:00Z'),
('file_008', 'invoice-INV-2026-008.pdf', 'document', 180000, 'application/pdf', '', 'Finance Bot', NULL, '2026-04-02T15:30:00Z'),
('file_009', 'banner-campaign.jpg', 'image', 4500000, 'image/jpeg', '', 'Marketing', '/api/files/file_009/thumbnail', '2026-04-02T09:00:00Z'),
('file_010', 'api-spec.yaml', 'document', 85000, 'text/yaml', '', 'Platform Lead', NULL, '2026-04-01T17:00:00Z'),
('file_011', 'user-avatar-default.png', 'image', 45000, 'image/png', '', 'System', '/api/files/file_011/thumbnail', '2026-04-01T08:00:00Z'),
('file_012', 'workflow-screenshot.png', 'image', 1650000, 'image/png', '', 'QA Engineer', '/api/files/file_012/thumbnail', '2026-03-31T14:00:00Z');
