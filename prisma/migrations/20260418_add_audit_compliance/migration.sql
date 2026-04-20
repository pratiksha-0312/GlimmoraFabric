-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" TEXT NOT NULL DEFAULT '',
    "actorEmail" TEXT NOT NULL DEFAULT '',
    "actorRole" TEXT NOT NULL DEFAULT '',
    "action" TEXT NOT NULL DEFAULT 'Accessed',
    "entity" TEXT NOT NULL DEFAULT '',
    "entityId" TEXT NOT NULL DEFAULT '',
    "details" TEXT NOT NULL DEFAULT '',
    "ip" TEXT NOT NULL DEFAULT '',
    "userAgent" TEXT NOT NULL DEFAULT '',
    "sessionId" TEXT NOT NULL DEFAULT '',
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "beforeJson" TEXT NOT NULL DEFAULT '',
    "afterJson" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs"("actor");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");

-- CreateTable
CREATE TABLE "compliance_reports" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Custom',
    "framework" TEXT NOT NULL DEFAULT 'Custom Framework',
    "period" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "date" TEXT NOT NULL DEFAULT '',
    "size" TEXT NOT NULL DEFAULT '—',
    "findings" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "generatedBy" TEXT NOT NULL DEFAULT 'System',
    "summary" TEXT NOT NULL DEFAULT '',
    "sections" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention_rules" (
    "id" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "retentionDays" INTEGER NOT NULL DEFAULT 365,
    "action" TEXT NOT NULL DEFAULT 'archive',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastPurge" TEXT NOT NULL DEFAULT 'Never',
    "recordsAffected" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retention_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "defaultRetention" INTEGER NOT NULL DEFAULT 365,
    "autoDeleteEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retention_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_export_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dataScope" TEXT NOT NULL DEFAULT 'Audit Logs',
    "format" TEXT NOT NULL DEFAULT 'CSV',
    "status" TEXT NOT NULL DEFAULT 'Queued',
    "requestedBy" TEXT NOT NULL DEFAULT '',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "fileSize" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "data_export_requests_pkey" PRIMARY KEY ("id")
);

-- Seed: retention settings (global singleton)
INSERT INTO "retention_settings" ("id", "defaultRetention", "autoDeleteEnabled", "updatedAt")
VALUES ('global', 365, true, CURRENT_TIMESTAMP);

-- Seed: retention rules
INSERT INTO "retention_rules" ("id", "dataType", "description", "retentionDays", "action", "enabled", "lastPurge", "recordsAffected", "sortOrder", "updatedAt") VALUES
('rr-1', 'Audit Logs', 'System audit trail events', 365, 'archive', true, '2026-03-01', 12450, 1, CURRENT_TIMESTAMP),
('rr-2', 'Session Data', 'User login sessions and tokens', 90, 'delete', true, '2026-03-15', 3280, 2, CURRENT_TIMESTAMP),
('rr-3', 'API Request Logs', 'Incoming API request metadata', 180, 'archive', true, '2026-02-28', 89700, 3, CURRENT_TIMESTAMP),
('rr-4', 'User Activity', 'User interaction and behavior data', 365, 'anonymize', true, '2026-03-01', 45200, 4, CURRENT_TIMESTAMP),
('rr-5', 'Error Logs', 'Application error and crash reports', 30, 'delete', true, '2026-03-28', 1560, 5, CURRENT_TIMESTAMP),
('rr-6', 'Notification History', 'Sent notification records', 60, 'delete', false, 'Never', 0, 6, CURRENT_TIMESTAMP),
('rr-7', 'Compliance Reports', 'Generated compliance report data', 730, 'archive', true, '2026-01-15', 24, 7, CURRENT_TIMESTAMP),
('rr-8', 'Deleted User Data', 'GDPR right-to-erasure queue', 30, 'delete', true, '2026-03-20', 8, 8, CURRENT_TIMESTAMP);

-- Seed: compliance reports
INSERT INTO "compliance_reports" ("id", "name", "type", "framework", "period", "status", "date", "size", "findings", "score", "generatedBy", "summary", "sections", "updatedAt") VALUES
('cr-001', 'SOC2 Type II - Q1 2026', 'SOC2', 'SOC2 Type II', 'Jan–Mar 2026', 'Generated', '2026-03-28', '2.4 MB', 0, 98, 'Vanshika Keswani',
 'The SOC2 Type II audit for Q1 2026 demonstrates strong compliance across all trust service criteria. No critical findings were identified.',
 '[{"name":"Access Control","score":100,"status":"pass","details":"All access controls properly implemented. MFA enforced for admin accounts."},{"name":"Data Encryption","score":100,"status":"pass","details":"AES-256 encryption at rest, TLS 1.3 in transit."},{"name":"Audit Logging","score":100,"status":"pass","details":"Comprehensive audit trail for all administrative actions."},{"name":"Incident Response","score":95,"status":"pass","details":"Incident response plan documented and tested."},{"name":"Change Management","score":98,"status":"pass","details":"All changes tracked via version control."},{"name":"Backup & Recovery","score":96,"status":"pass","details":"Daily backups with 30-day retention."},{"name":"Network Security","score":100,"status":"pass","details":"WAF and DDoS protection active."},{"name":"Vendor Management","score":95,"status":"pass","details":"All vendors assessed annually."}]',
 CURRENT_TIMESTAMP),
('cr-002', 'GDPR Data Processing Assessment', 'GDPR', 'GDPR Article 30', 'Q1 2026', 'Generated', '2026-03-25', '1.8 MB', 2, 94, 'Pratiksha M.',
 'The GDPR assessment for Q1 2026 shows overall compliance with 2 minor findings requiring attention.',
 '[{"name":"Lawful Basis for Processing","score":100,"status":"pass","details":"All data processing activities have documented lawful basis."},{"name":"Data Subject Rights","score":90,"status":"warning","details":"Finding: Response time for erasure requests averages 28 days (target: 30 days)."},{"name":"Data Protection Impact Assessment","score":95,"status":"pass","details":"DPIAs completed for all high-risk processing activities."},{"name":"Cross-Border Transfers","score":88,"status":"warning","details":"Finding: Two data transfers require updated Standard Contractual Clauses."},{"name":"Data Breach Notification","score":100,"status":"pass","details":"72-hour notification process documented and tested."},{"name":"Records of Processing","score":95,"status":"pass","details":"Article 30 records maintained and up-to-date."}]',
 CURRENT_TIMESTAMP),
('cr-003', 'Banking Audit Q1 2026', 'Banking Audit', 'Custom Framework', 'Q1 2026', 'Pending', '2026-03-30', '—', 0, 0, 'System', '', '[]', CURRENT_TIMESTAMP),
('cr-004', 'Security Assessment - Annual', 'Security Assessment', 'NIST CSF', '2025-2026', 'Generated', '2026-03-20', '3.1 MB', 1, 96, 'Vanshika Keswani', 'Annual security assessment under NIST CSF shows strong posture with one minor finding.', '[]', CURRENT_TIMESTAMP),
('cr-005', 'PCI-DSS Compliance v4.0', 'PCI-DSS', 'PCI-DSS v4.0', 'Q1 2026', 'Generated', '2026-03-15', '1.5 MB', 0, 100, 'Pratiksha M.', 'Full PCI-DSS v4.0 compliance confirmed.', '[]', CURRENT_TIMESTAMP),
('cr-006', 'HIPAA Security Review', 'HIPAA', 'HIPAA Security Rule', 'Q1 2026', 'Failed', '2026-03-22', '—', 0, 0, 'System', '', '[]', CURRENT_TIMESTAMP),
('cr-007', 'ISO 27001 Internal Audit', 'Custom', 'ISO 27001', 'Feb 2026', 'Generated', '2026-02-28', '4.2 MB', 3, 91, 'Vanshika Keswani', 'ISO 27001 internal audit with 3 findings to address.', '[]', CURRENT_TIMESTAMP),
('cr-008', 'GDPR Right to Erasure Audit', 'GDPR', 'GDPR Article 30', 'Jan–Feb 2026', 'Generated', '2026-02-15', '0.9 MB', 0, 100, 'Pratiksha M.', 'No outstanding erasure requests.', '[]', CURRENT_TIMESTAMP);

-- Seed: data export requests
INSERT INTO "data_export_requests" ("id", "name", "dataScope", "format", "status", "requestedBy", "requestedAt", "completedAt", "fileSize", "progress", "reason") VALUES
('exp-001', 'Full Audit Log Export', 'Audit Logs', 'CSV', 'Completed', 'Vanshika Keswani', '2026-04-07 08:00:00', '2026-04-07 08:12:00', '45.2 MB', 100, 'Annual compliance audit'),
('exp-002', 'User Data - GDPR Request', 'User PII', 'JSON', 'Completed', 'Pratiksha M.', '2026-04-06 14:30:00', '2026-04-06 14:35:00', '2.1 MB', 100, 'GDPR data subject access request'),
('exp-003', 'Tenant Usage Analytics', 'Usage Metrics', 'CSV', 'Processing', 'Vanshika Keswani', '2026-04-07 09:15:00', NULL, NULL, 67, 'Quarterly business review'),
('exp-004', 'Security Events - March 2026', 'Security Events', 'PDF', 'Completed', 'Pratiksha M.', '2026-04-05 10:00:00', '2026-04-05 10:08:00', '8.7 MB', 100, 'Security incident review'),
('exp-005', 'Compliance Report Bundle', 'Compliance Data', 'PDF', 'Queued', 'Vanshika Keswani', '2026-04-07 09:30:00', NULL, NULL, 0, 'Board presentation preparation'),
('exp-006', 'Payment Transaction History', 'Payment Data', 'CSV', 'Failed', 'Pratiksha M.', '2026-04-04 16:00:00', NULL, NULL, 34, 'Financial reconciliation');

-- Seed: audit logs
INSERT INTO "audit_logs" ("id", "timestamp", "actor", "actorEmail", "actorRole", "action", "entity", "entityId", "details", "ip", "userAgent", "sessionId", "isCritical", "beforeJson", "afterJson") VALUES
('al-001', '2026-04-07 09:42:15', 'Vanshika Keswani', 'vanshika@glimmora.com', 'super_admin', 'Updated', 'User Role', 'usr-012', 'Changed role from Member to Admin for user Rahul Sharma', '192.168.1.10', 'Chrome 126 / Windows 11', 'sess_a1b2c3d4', false,
 '{"role":"Member","permissions":"read, write"}', '{"role":"Admin","permissions":"read, write, delete, manage"}'),
('al-002', '2026-04-07 09:38:22', 'System', 'system@glimmora.com', 'system', 'Created', 'API Token', 'tok-089', 'Auto-generated API token for VerifAI integration service', '—', 'System Process', 'sys_auto', false,
 '', '{"token":"tk_verifai_***","scopes":"read, webhook","expiry":"2026-07-07"}'),
('al-003', '2026-04-07 09:15:30', 'Vanshika Keswani', 'vanshika@glimmora.com', 'super_admin', 'Deleted', 'Team Member', 'usr-007', 'Removed user Amit Patel from tenant GlimmoraCorp', '192.168.1.22', 'Firefox 127 / macOS', 'sess_d4e5f6g7', false,
 '{"name":"Amit Patel","status":"Active","tenant":"GlimmoraCorp"}', '{"name":"Amit Patel","status":"Removed","tenant":"—"}'),
('al-004', '2026-04-07 08:58:00', 'System', 'system@glimmora.com', 'system', 'Login', 'Security', 'sec-alert-44', 'Failed login attempt detected from suspicious IP 45.33.12.89 — 5 attempts in 2 minutes', '45.33.12.89', 'Unknown', 'sys_alert', true, '', ''),
('al-005', '2026-04-07 08:30:11', 'Vanshika Keswani', 'vanshika@glimmora.com', 'super_admin', 'Config Change', 'MFA Policy', 'cfg-mfa', 'Updated MFA enforcement policy for all admin accounts', '192.168.1.10', 'Chrome 126 / Windows 11', 'sess_g7h8i9j0', false,
 '{"enforcement":"Optional","scope":"All Users"}', '{"enforcement":"Required","scope":"Admin Users"}'),
('al-006', '2026-04-07 08:12:45', 'Pratiksha M.', 'pratiksha@glimmora.com', 'tenant_admin', 'Created', 'Workflow', 'wf-inv-001', 'Created new invoice approval workflow with 3-step hierarchy', '192.168.1.35', 'Chrome 126 / Linux', 'sess_j0k1l2m3', false,
 '', '{"name":"invoice-approval-v1","steps":"3","approvers":"Manager → Finance → CFO"}'),
('al-007', '2026-04-06 23:45:20', 'System', 'system@glimmora.com', 'system', 'Config Change', 'Notification', 'ntf-pay-fail', 'Payment failure alert triggered for tenant Diamond Corp — invoice INV-2026-0892', '—', 'System Process', 'sys_notify', true,
 '{"paymentStatus":"Processing","amount":"$4,200"}', '{"paymentStatus":"Failed","reason":"Card declined"}'),
('al-008', '2026-04-06 22:20:00', 'Vanshika Keswani', 'vanshika@glimmora.com', 'super_admin', 'Created', 'Tenant', 'tnt-diamond', 'Onboarded Diamond Corp on Pro plan with 25-user license', '192.168.1.10', 'Chrome 126 / Windows 11', 'sess_m3n4o5p6', false,
 '', '{"tenant":"Diamond Corp","plan":"Pro","users":"25","region":"US-East"}'),
('al-009', '2026-04-06 21:55:33', 'Pratiksha M.', 'pratiksha@glimmora.com', 'auditor', 'Exported', 'Report', 'rpt-soc2-q1', 'Exported SOC2 compliance report for Q1 2026', '192.168.1.48', 'Safari 18 / macOS', 'sess_p6q7r8s9', false,
 '', '{"file":"soc2-q1-2026.pdf","format":"PDF","size":"2.4 MB"}'),
('al-010', '2026-04-06 18:30:00', 'System', 'system@glimmora.com', 'system', 'Accessed', 'API Gateway', 'apigw-tk29', 'Unusual API volume detected — token tk_29x hit 890 req/min (threshold: 100)', '203.0.113.42', 'API Client v2.1', 'sys_alert', true,
 '{"rate":"50 req/min","status":"Normal"}', '{"rate":"890 req/min","status":"Rate Limited"}'),
('al-011', '2026-04-06 16:20:10', 'Vanshika Keswani', 'vanshika@glimmora.com', 'super_admin', 'Accessed', 'Configuration', 'cfg-secrets', 'Viewed production secrets and environment variables page', '192.168.1.22', 'Firefox 127 / macOS', 'sess_s9t0u1v2', false, '', ''),
('al-012', '2026-04-06 14:00:45', 'Pratiksha M.', 'pratiksha@glimmora.com', 'tenant_admin', 'Updated', 'Workflow', 'wf-pay-001', 'Modified payment approval threshold from $500 to $1,000', '192.168.1.55', 'Chrome 126 / Windows 11', 'sess_v2w3x4y5', false,
 '{"threshold":"$500","autoApprove":"false"}', '{"threshold":"$1,000","autoApprove":"false"}'),
('al-013', '2026-04-06 11:30:22', 'Vanshika Keswani', 'vanshika@glimmora.com', 'super_admin', 'Permission Change', 'Role', 'role-dev', 'Added deploy permission to Developer role across all tenants', '192.168.1.10', 'Chrome 126 / Windows 11', 'sess_y5z6a7b8', false,
 '{"permissions":"read, write, debug"}', '{"permissions":"read, write, debug, deploy"}'),
('al-014', '2026-04-06 09:15:00', 'System', 'system@glimmora.com', 'system', 'Login', 'Authentication', 'auth-brute', 'Brute-force protection activated — IP 182.73.22.11 blocked for 30 minutes', '182.73.22.11', 'Unknown / Automated', 'sys_security', true,
 '{"failedAttempts":"8","accountStatus":"Active"}', '{"failedAttempts":"8","accountStatus":"Locked (30min)"}'),
('al-015', '2026-04-05 17:45:00', 'Pratiksha M.', 'pratiksha@glimmora.com', 'tenant_admin', 'Created', 'User', 'usr-new-15', 'Invited new team member dev@glimmora.com as Developer', '192.168.1.35', 'Chrome 126 / Linux', 'sess_c8d9e0f1', false,
 '', '{"email":"dev@glimmora.com","role":"Developer","status":"Invited"}'),
('al-016', '2026-04-05 15:22:00', 'Vanshika Keswani', 'vanshika@glimmora.com', 'super_admin', 'Deleted', 'API Token', 'tok-old-003', 'Revoked expired staging API token for legacy integration', '192.168.1.10', 'Chrome 126 / Windows 11', 'sess_g2h3i4j5', false,
 '{"token":"tk_staging_***","status":"Expired","lastUsed":"2026-02-10"}', '{"token":"tk_staging_***","status":"Revoked"}'),
('al-017', '2026-04-05 12:00:00', 'System', 'system@glimmora.com', 'system', 'Exported', 'Data', 'export-50k', 'Large data export triggered — 50,000 records by non-admin user flagged for review', '192.168.1.55', 'Chrome 126 / Windows 11', 'sys_flag', true,
 '', '{"records":"50,000","format":"CSV","flagged":"true"}'),
('al-018', '2026-04-05 10:30:11', 'Vanshika Keswani', 'vanshika@glimmora.com', 'super_admin', 'Updated', 'Tenant', 'tnt-acme', 'Upgraded Acme Corp from Starter to Business plan', '192.168.1.10', 'Chrome 126 / Windows 11', 'sess_k5l6m7n8', false,
 '{"plan":"Starter","users":"10","storage":"5 GB"}', '{"plan":"Business","users":"50","storage":"50 GB"}'),
('al-019', '2026-04-05 08:00:00', 'Pratiksha M.', 'pratiksha@glimmora.com', 'auditor', 'Accessed', 'Audit Logs', 'audit-access', 'Accessed full audit log export for compliance review', '192.168.1.48', 'Safari 18 / macOS', 'sess_o8p9q0r1', false, '', ''),
('al-020', '2026-04-04 22:15:00', 'System', 'system@glimmora.com', 'system', 'Config Change', 'SSL Certificate', 'ssl-renewal', 'Auto-renewed SSL certificate for api.glimmora.com — expires 2027-04-04', '—', 'System Process', 'sys_auto', false,
 '{"expiry":"2026-04-10","issuer":"Let''s Encrypt"}', '{"expiry":"2027-04-04","issuer":"Let''s Encrypt"}');
