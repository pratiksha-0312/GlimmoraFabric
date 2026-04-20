-- CreateTable: document_templates
CREATE TABLE "document_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'invoice',
    "format" TEXT NOT NULL DEFAULT 'html',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "content" TEXT NOT NULL DEFAULT '',
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable: document_template_versions
CREATE TABLE "document_template_versions" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'previous',
    "changedBy" TEXT NOT NULL,
    "changeDescription" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_template_versions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "document_template_versions_templateId_version_key"
  ON "document_template_versions"("templateId", "version");

ALTER TABLE "document_template_versions" ADD CONSTRAINT "document_template_versions_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "document_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: documents
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templateId" TEXT,
    "tenantId" TEXT,
    "tenant" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'generated',
    "format" TEXT NOT NULL DEFAULT 'pdf',
    "size" TEXT NOT NULL DEFAULT '',
    "createdBy" TEXT NOT NULL,
    "auditJson" TEXT NOT NULL DEFAULT '[]',
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "documents" ADD CONSTRAINT "documents_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "document_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: document_signatures
CREATE TABLE "document_signatures" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "signerName" TEXT NOT NULL,
    "signerEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signedAt" TIMESTAMP(3),
    "ip" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "document_signatures_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "document_signatures_documentId_idx" ON "document_signatures"("documentId");

ALTER TABLE "document_signatures" ADD CONSTRAINT "document_signatures_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed: document_templates
INSERT INTO "document_templates" ("id", "name", "description", "type", "format", "status", "version", "content", "usageCount", "createdBy", "updatedBy", "createdAt", "updatedAt") VALUES
('dt-001', 'Invoice Template', 'Standard invoice for all tenants', 'invoice', 'html', 'published', 3, '<h1>Invoice #{{invoice_id}}</h1><p>Date: {{date}}</p><p>Tenant: {{tenant_name}}</p><table><tr><th>Item</th><th>Amount</th></tr><tr><td>{{item_name}}</td><td>{{item_amount}}</td></tr></table><p><strong>Total: {{total}}</strong></p>', 1245, 'Vanshika Keswani', 'Vanshika Keswani', '2026-03-15T10:00:00Z', '2026-04-07T14:30:00Z'),
('dt-002', 'NDA Agreement', 'Non-disclosure agreement template', 'legal', 'html', 'published', 5, '<h1>Non-Disclosure Agreement</h1><p>This NDA is entered into by {{party_a}} and {{party_b}} on {{effective_date}}.</p><h2>1. Definition of Confidential Information</h2><p>{{confidential_info_definition}}</p><h2>2. Obligations</h2><p>The receiving party agrees to protect the confidential information.</p>', 890, 'Vanshika Keswani', 'Pratiksha M.', '2026-02-10T09:00:00Z', '2026-04-05T16:45:00Z'),
('dt-003', 'Certificate of Completion', 'Training completion certificate', 'certificate', 'html', 'published', 2, '<div style="text-align:center"><h1>Certificate of Completion</h1><p>This certifies that</p><h2>{{recipient_name}}</h2><p>has successfully completed</p><h3>{{course_name}}</h3><p>on {{completion_date}}</p></div>', 3420, 'Pratiksha M.', 'Pratiksha M.', '2026-03-01T11:00:00Z', '2026-04-03T11:20:00Z'),
('dt-004', 'Service Contract', 'Standard service agreement', 'contract', 'html', 'published', 4, '<h1>Service Contract</h1><p>Between {{provider}} and {{client}}</p><h2>Scope of Services</h2><p>{{scope}}</p><h2>Terms</h2><p>Duration: {{duration}}</p><p>Fee: {{fee}}</p>', 670, 'Vanshika Keswani', 'Vanshika Keswani', '2026-01-20T08:00:00Z', '2026-04-01T08:10:00Z'),
('dt-005', 'Receipt Template', 'Payment receipt for transactions', 'receipt', 'html', 'published', 1, '<h1>Payment Receipt</h1><p>Receipt #: {{receipt_id}}</p><p>Date: {{date}}</p><p>From: {{payer}}</p><p>Amount: {{amount}}</p><p>Method: {{method}}</p>', 5200, 'Pratiksha M.', 'Pratiksha M.', '2026-03-25T14:00:00Z', '2026-03-25T14:00:00Z'),
('dt-006', 'Employment Offer Letter', 'Job offer letter template', 'legal', 'html', 'draft', 1, '<h1>Offer of Employment</h1><p>Dear {{candidate_name}},</p><p>We are pleased to offer you the position of {{position}} at {{company}}.</p><p>Start Date: {{start_date}}</p><p>Salary: {{salary}}</p>', 0, 'Vanshika Keswani', 'Vanshika Keswani', '2026-04-05T10:00:00Z', '2026-04-05T10:00:00Z'),
('dt-007', 'Monthly Report', 'Monthly business report template', 'report', 'html', 'draft', 1, '<h1>Monthly Report - {{month}} {{year}}</h1><h2>Summary</h2><p>{{summary}}</p><h2>Key Metrics</h2><p>Revenue: {{revenue}}</p><p>Growth: {{growth}}</p>', 0, 'Pratiksha M.', 'Pratiksha M.', '2026-04-08T09:00:00Z', '2026-04-08T09:00:00Z'),
('dt-008', 'Privacy Policy', 'Standard privacy policy document', 'legal', 'html', 'archived', 2, '<h1>Privacy Policy</h1><p>Last updated: {{date}}</p><p>{{company}} respects your privacy.</p>', 150, 'Vanshika Keswani', 'Vanshika Keswani', '2025-12-01T08:00:00Z', '2026-02-15T10:00:00Z');

-- Seed: document_template_versions
INSERT INTO "document_template_versions" ("id", "templateId", "version", "status", "changedBy", "changeDescription", "content", "createdAt") VALUES
('dtv-001-3', 'dt-001', 3, 'current', 'Vanshika Keswani', 'Added support for line items', '<h1>Invoice #{{invoice_id}}</h1><p>Date: {{date}}</p><p>Tenant: {{tenant_name}}</p><table><tr><th>Item</th><th>Amount</th></tr><tr><td>{{item_name}}</td><td>{{item_amount}}</td></tr></table><p><strong>Total: {{total}}</strong></p>', '2026-04-07T14:30:00Z'),
('dtv-001-2', 'dt-001', 2, 'previous', 'Pratiksha M.', 'Updated header styling', '<h1>Invoice {{invoice_id}}</h1><p>{{date}}</p><p>{{tenant_name}}</p>', '2026-03-20T10:00:00Z'),
('dtv-001-1', 'dt-001', 1, 'previous', 'Vanshika Keswani', 'Initial version', '<h1>Invoice</h1><p>{{invoice_id}}</p>', '2026-03-15T10:00:00Z'),
('dtv-002-5', 'dt-002', 5, 'current', 'Pratiksha M.', 'Legal language review', '<h1>Non-Disclosure Agreement</h1><p>This NDA is entered into by {{party_a}} and {{party_b}} on {{effective_date}}.</p><h2>1. Definition of Confidential Information</h2><p>{{confidential_info_definition}}</p><h2>2. Obligations</h2><p>The receiving party agrees to protect the confidential information.</p>', '2026-04-05T16:45:00Z'),
('dtv-002-4', 'dt-002', 4, 'previous', 'Pratiksha M.', 'Added obligations clause', '<h1>NDA</h1><p>Between {{party_a}} and {{party_b}}</p>', '2026-03-10T12:00:00Z');

-- Seed: documents
INSERT INTO "documents" ("id", "name", "templateId", "tenantId", "tenant", "status", "format", "size", "createdBy", "auditJson", "signedAt", "signedBy", "createdAt", "updatedAt") VALUES
('doc-001', 'Invoice #INV-2026-0142', 'dt-001', NULL, 'Acme Corp', 'signed', 'pdf', '245 KB', 'Vanshika Keswani',
 '[{"action":"Document created","actor":"Vanshika Keswani","timestamp":"2026-04-07T14:30:00Z"},{"action":"Signature requested","actor":"Vanshika Keswani","timestamp":"2026-04-07T14:35:00Z"},{"action":"Signed by John Smith","actor":"John Smith","timestamp":"2026-04-07T16:00:00Z"}]',
 '2026-04-07T16:00:00Z', 'John Smith', '2026-04-07T14:30:00Z', '2026-04-07T16:00:00Z'),
('doc-002', 'NDA - Project Alpha', 'dt-002', NULL, 'TechStart Inc', 'pending_sign', 'pdf', '180 KB', 'Pratiksha M.',
 '[{"action":"Document created","actor":"Pratiksha M.","timestamp":"2026-04-06T10:15:00Z"},{"action":"Signature requested for Sarah Chen","actor":"Pratiksha M.","timestamp":"2026-04-06T10:20:00Z"},{"action":"Signature requested for Mike Johnson","actor":"Pratiksha M.","timestamp":"2026-04-06T10:20:00Z"},{"action":"Signed by Sarah Chen","actor":"Sarah Chen","timestamp":"2026-04-06T14:00:00Z"}]',
 NULL, NULL, '2026-04-06T10:15:00Z', '2026-04-06T14:00:00Z'),
('doc-003', 'Certificate - Data Privacy Training', 'dt-003', NULL, 'Acme Corp', 'generated', 'pdf', '120 KB', 'System',
 '[{"action":"Document created","actor":"System","timestamp":"2026-04-05T09:00:00Z"}]',
 NULL, NULL, '2026-04-05T09:00:00Z', '2026-04-05T09:00:00Z'),
('doc-004', 'Service Contract - Acme Corp Q2', 'dt-004', NULL, 'Acme Corp', 'signed', 'pdf', '320 KB', 'Vanshika Keswani',
 '[{"action":"Document created","actor":"Vanshika Keswani","timestamp":"2026-04-01T08:00:00Z"},{"action":"Signature requested","actor":"Vanshika Keswani","timestamp":"2026-04-01T08:05:00Z"},{"action":"Signed by Acme Corp","actor":"Jane Rodriguez","timestamp":"2026-04-02T11:30:00Z"}]',
 '2026-04-02T11:30:00Z', 'Jane Rodriguez', '2026-04-01T08:00:00Z', '2026-04-02T11:30:00Z'),
('doc-005', 'Receipt - Subscription Renewal', 'dt-005', NULL, 'Diamond Corp', 'generated', 'pdf', '85 KB', 'System',
 '[{"action":"Document created","actor":"System","timestamp":"2026-04-04T12:00:00Z"}]',
 NULL, NULL, '2026-04-04T12:00:00Z', '2026-04-04T12:00:00Z');

-- Seed: document_signatures
INSERT INTO "document_signatures" ("id", "documentId", "signerName", "signerEmail", "status", "requestedAt", "signedAt", "ip", "sortOrder") VALUES
('sig-001', 'doc-001', 'John Smith', 'john@acme.com', 'signed', '2026-04-07T14:35:00Z', '2026-04-07T16:00:00Z', '192.168.1.10', 0),
('sig-002', 'doc-002', 'Sarah Chen', 'sarah@techstart.com', 'signed', '2026-04-06T10:20:00Z', '2026-04-06T14:00:00Z', '10.0.0.5', 0),
('sig-003', 'doc-002', 'Mike Johnson', 'mike@techstart.com', 'pending', '2026-04-06T10:20:00Z', NULL, NULL, 1),
('sig-004', 'doc-004', 'Jane Rodriguez', 'jane@acme.com', 'signed', '2026-04-01T08:05:00Z', '2026-04-02T11:30:00Z', '192.168.2.14', 0);
